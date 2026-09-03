from calendar import monthrange
from datetime import date, datetime, timezone
from decimal import Decimal

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import settings
from .db import Base, engine, get_db
from .dependencies import current_user
from .encryption_backfill import run_encryption_backfill
from .encryption import lookup_digest
from .models import Account, Budget, Goal, Loan, LoanPayment, RecurringBill, Transaction, User
from .schemas import (
    AccountCreate,
    AccountResponse,
    BudgetCreate,
    BudgetResponse,
    GoalCreate,
    GoalResponse,
    LoginRequest,
    LoanCreate,
    LoanPaymentCreate,
    LoanPaymentResponse,
    RecurringBillCreate,
    RecurringBillPaymentCreate,
    RecurringBillResponse,
    RecurringBillStatusCreate,
    LoanResponse,
    RegisterRequest,
    TokenResponse,
    TransactionCreate,
    TransactionResponse,
    UserResponse,
)
from .security import create_access_token, hash_password, verify_password


app = FastAPI(title="MoneyFlow API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


def attach_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie("moneyflow_access_token", token, httponly=True, secure=settings.environment != "development", samesite="none" if settings.environment != "development" else "lax", max_age=settings.access_token_minutes * 60, path="/")


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
    run_encryption_backfill()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.environment}


@app.get("/api/export")
def export_finances(user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict[str, object]:
    records = {"accounts": db.scalars(select(Account).where(Account.user_id == user.id)).all(), "transactions": db.scalars(select(Transaction).where(Transaction.user_id == user.id)).all(), "budgets": db.scalars(select(Budget).where(Budget.user_id == user.id)).all(), "loans": db.scalars(select(Loan).where(Loan.user_id == user.id)).all(), "loan_payments": db.scalars(select(LoanPayment).where(LoanPayment.user_id == user.id)).all(), "goals": db.scalars(select(Goal).where(Goal.user_id == user.id)).all(), "recurring_bills": db.scalars(select(RecurringBill).where(RecurringBill.user_id == user.id)).all()}
    def clean(record: object) -> dict[str, object]:
        return {column.name: getattr(record, column.name) for column in record.__table__.columns}  # type: ignore[attr-defined]
    return {"exported_at": datetime.now(timezone.utc).isoformat(), "user": {"id": user.id, "email": user.email, "display_name": user.display_name}, **{name: [clean(item) for item in items] for name, items in records.items()}}


@app.post("/api/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    email = payload.email.lower()
    if db.scalar(select(User).where(User.email_lookup == lookup_digest(email))):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = User(email=email, email_lookup=lookup_digest(email), display_name=payload.display_name.strip(), password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    attach_auth_cookie(response, token)
    return TokenResponse(access_token=token, user=user)


@app.post("/api/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email_lookup == lookup_digest(payload.email)))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user.id)
    attach_auth_cookie(response, token)
    return TokenResponse(access_token=token, user=user)


@app.post("/api/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    response.delete_cookie("moneyflow_access_token", path="/")


@app.get("/api/me", response_model=UserResponse)
def me(user: User = Depends(current_user)) -> User:
    return user


@app.get("/api/accounts", response_model=list[AccountResponse])
def list_accounts(user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[Account]:
    return list(db.scalars(select(Account).where(Account.user_id == user.id).order_by(Account.id)).all())


@app.post("/api/accounts", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(payload: AccountCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Account:
    account = Account(user_id=user.id, **payload.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@app.put("/api/accounts/{account_id}", response_model=AccountResponse)
def update_account(account_id: int, payload: AccountCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Account:
    account = db.scalar(select(Account).where(Account.id == account_id, Account.user_id == user.id, Account.is_archived.is_(False)))
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    for field, value in payload.model_dump().items():
        setattr(account, field, value)
    db.commit()
    db.refresh(account)
    return account


@app.delete("/api/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def archive_account(account_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> None:
    account = db.scalar(select(Account).where(Account.id == account_id, Account.user_id == user.id, Account.is_archived.is_(False)))
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    account.is_archived = True
    db.commit()


@app.get("/api/transactions", response_model=list[TransactionResponse])
def list_transactions(user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[Transaction]:
    records = list(db.scalars(select(Transaction).where(Transaction.user_id == user.id).order_by(Transaction.id.desc())).all())
    return sorted(records, key=lambda item: (item.occurred_on, item.id), reverse=True)


@app.post("/api/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(payload: TransactionCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Transaction:
    account = db.scalar(select(Account).where(Account.id == payload.account_id, Account.user_id == user.id))
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    transaction = Transaction(user_id=user.id, **payload.model_dump())
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@app.delete("/api/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> None:
    transaction = db.scalar(select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == user.id))
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(transaction)
    db.commit()


@app.put("/api/transactions/{transaction_id}", response_model=TransactionResponse)
def update_transaction(transaction_id: int, payload: TransactionCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Transaction:
    transaction = db.scalar(select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == user.id))
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    account = db.scalar(select(Account).where(Account.id == payload.account_id, Account.user_id == user.id, Account.is_archived.is_(False)))
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    for field, value in payload.model_dump().items():
        setattr(transaction, field, value)
    db.commit()
    db.refresh(transaction)
    return transaction


@app.get("/api/budgets", response_model=list[BudgetResponse])
def list_budgets(user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[Budget]:
    return list(db.scalars(select(Budget).where(Budget.user_id == user.id).order_by(Budget.id)).all())


@app.post("/api/budgets", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(payload: BudgetCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Budget:
    budget = Budget(user_id=user.id, **payload.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@app.put("/api/budgets/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: int, payload: BudgetCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Budget:
    budget = db.scalar(select(Budget).where(Budget.id == budget_id, Budget.user_id == user.id))
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    budget.category = payload.category
    budget.monthly_limit = payload.monthly_limit
    db.commit()
    db.refresh(budget)
    return budget


@app.delete("/api/budgets/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(budget_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> None:
    budget = db.scalar(select(Budget).where(Budget.id == budget_id, Budget.user_id == user.id))
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()


@app.get("/api/loans", response_model=list[LoanResponse])
def list_loans(user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[Loan]:
    return list(db.scalars(select(Loan).where(Loan.user_id == user.id).order_by(Loan.id)).all())


@app.post("/api/loans", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
def create_loan(payload: LoanCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Loan:
    loan = Loan(user_id=user.id, **payload.model_dump())
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@app.put("/api/loans/{loan_id}", response_model=LoanResponse)
def update_loan(loan_id: int, payload: LoanCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Loan:
    loan = db.scalar(select(Loan).where(Loan.id == loan_id, Loan.user_id == user.id))
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    for field, value in payload.model_dump().items():
        setattr(loan, field, value)
    db.commit()
    db.refresh(loan)
    return loan


@app.delete("/api/loans/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_loan(loan_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> None:
    loan = db.scalar(select(Loan).where(Loan.id == loan_id, Loan.user_id == user.id))
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    db.delete(loan)
    db.commit()


@app.get("/api/loans/{loan_id}/payments", response_model=list[LoanPaymentResponse])
def list_loan_payments(loan_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[LoanPayment]:
    loan = db.scalar(select(Loan).where(Loan.id == loan_id, Loan.user_id == user.id))
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    records = list(db.scalars(select(LoanPayment).where(LoanPayment.loan_id == loan_id, LoanPayment.user_id == user.id).order_by(LoanPayment.id.desc())).all())
    return sorted(records, key=lambda item: (item.paid_on, item.id), reverse=True)


@app.post("/api/loans/{loan_id}/payments", response_model=LoanPaymentResponse, status_code=status.HTTP_201_CREATED)
def create_loan_payment(loan_id: int, payload: LoanPaymentCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> LoanPayment:
    loan = db.scalar(select(Loan).where(Loan.id == loan_id, Loan.user_id == user.id))
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    if payload.principal_amount + payload.interest_amount != payload.amount:
        raise HTTPException(status_code=422, detail="Principal and interest must equal the payment amount")
    if payload.principal_amount > loan.remaining_balance:
        raise HTTPException(status_code=422, detail="Principal cannot exceed the remaining loan balance")
    payment = LoanPayment(user_id=user.id, loan_id=loan.id, **payload.model_dump())
    loan.remaining_balance -= payload.principal_amount
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@app.delete("/api/loans/{loan_id}/payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_loan_payment(loan_id: int, payment_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> None:
    payment = db.scalar(select(LoanPayment).where(LoanPayment.id == payment_id, LoanPayment.loan_id == loan_id, LoanPayment.user_id == user.id))
    if not payment:
        raise HTTPException(status_code=404, detail="Loan payment not found")
    loan = db.scalar(select(Loan).where(Loan.id == loan_id, Loan.user_id == user.id))
    if loan:
        loan.remaining_balance += payment.principal_amount
    db.delete(payment)
    db.commit()


@app.get("/api/goals", response_model=list[GoalResponse])
def list_goals(user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[Goal]:
    return list(db.scalars(select(Goal).where(Goal.user_id == user.id).order_by(Goal.id)).all())


@app.post("/api/goals", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(payload: GoalCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Goal:
    goal = Goal(user_id=user.id, **payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@app.put("/api/goals/{goal_id}", response_model=GoalResponse)
def update_goal(goal_id: int, payload: GoalCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Goal:
    goal = db.scalar(select(Goal).where(Goal.id == goal_id, Goal.user_id == user.id))
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    for field, value in payload.model_dump().items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return goal


@app.delete("/api/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> None:
    goal = db.scalar(select(Goal).where(Goal.id == goal_id, Goal.user_id == user.id))
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()


@app.get("/api/recurring-bills", response_model=list[RecurringBillResponse])
def list_recurring_bills(user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[RecurringBill]:
    records = list(db.scalars(select(RecurringBill).where(RecurringBill.user_id == user.id, RecurringBill.is_archived.is_(False)).order_by(RecurringBill.id)).all())
    return sorted(records, key=lambda item: (item.next_due, item.id))


@app.post("/api/recurring-bills", response_model=RecurringBillResponse, status_code=status.HTTP_201_CREATED)
def create_recurring_bill(payload: RecurringBillCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> RecurringBill:
    bill = RecurringBill(user_id=user.id, **payload.model_dump())
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill


@app.put("/api/recurring-bills/{bill_id}", response_model=RecurringBillResponse)
def update_recurring_bill(bill_id: int, payload: RecurringBillCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> RecurringBill:
    bill = db.scalar(select(RecurringBill).where(RecurringBill.id == bill_id, RecurringBill.user_id == user.id, RecurringBill.is_archived.is_(False)))
    if not bill:
        raise HTTPException(status_code=404, detail="Recurring bill not found")
    for field, value in payload.model_dump().items():
        setattr(bill, field, value)
    db.commit()
    db.refresh(bill)
    return bill


@app.post("/api/recurring-bills/{bill_id}/pay", response_model=RecurringBillResponse)
def pay_recurring_bill(bill_id: int, payload: RecurringBillPaymentCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> RecurringBill:
    bill = db.scalar(select(RecurringBill).where(RecurringBill.id == bill_id, RecurringBill.user_id == user.id, RecurringBill.is_archived.is_(False)))
    account = db.scalar(select(Account).where(Account.id == payload.account_id, Account.user_id == user.id, Account.is_archived.is_(False)))
    if not bill:
        raise HTTPException(status_code=404, detail="Recurring bill not found")
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    transaction = Transaction(user_id=user.id, account_id=account.id, transaction_type="expense", amount=bill.amount, name=bill.name, category=bill.category, occurred_on=payload.occurred_on, notes="Recurring bill payment")
    next_due = bill.next_due
    while next_due <= payload.occurred_on:
        if bill.frequency == "weekly":
            next_due = next_due.fromordinal(next_due.toordinal() + 7)
        elif bill.frequency == "yearly":
            next_year = next_due.year + 1
            next_due = date(next_year, next_due.month, min(next_due.day, monthrange(next_year, next_due.month)[1]))
        else:
            next_month = next_due.month % 12 + 1
            next_year = next_due.year + (1 if next_due.month == 12 else 0)
            next_due = date(next_year, next_month, min(next_due.day, monthrange(next_year, next_month)[1]))
    bill.next_due = next_due
    bill.last_status = "paid"
    bill.last_occurrence = payload.occurred_on
    db.add(transaction)
    db.commit()
    db.refresh(bill)
    return bill


@app.post("/api/recurring-bills/{bill_id}/status", response_model=RecurringBillResponse)
def update_recurring_bill_status(bill_id: int, payload: RecurringBillStatusCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> RecurringBill:
    bill = db.scalar(select(RecurringBill).where(RecurringBill.id == bill_id, RecurringBill.user_id == user.id, RecurringBill.is_archived.is_(False)))
    if not bill:
        raise HTTPException(status_code=404, detail="Recurring bill not found")
    if bill.last_occurrence == payload.occurrence_on:
        raise HTTPException(status_code=409, detail="This bill occurrence already has a status")
    bill.last_status = payload.status
    bill.last_occurrence = payload.occurrence_on
    bill.next_due = payload.next_due
    db.commit()
    db.refresh(bill)
    return bill


@app.delete("/api/recurring-bills/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
def archive_recurring_bill(bill_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> None:
    bill = db.scalar(select(RecurringBill).where(RecurringBill.id == bill_id, RecurringBill.user_id == user.id, RecurringBill.is_archived.is_(False)))
    if not bill:
        raise HTTPException(status_code=404, detail="Recurring bill not found")
    bill.is_archived = True
    db.commit()
