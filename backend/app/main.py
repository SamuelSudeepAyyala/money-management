from decimal import Decimal

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import settings
from .db import Base, engine, get_db
from .dependencies import current_user
from .models import Account, Transaction, User
from .schemas import (
    AccountCreate,
    AccountResponse,
    LoginRequest,
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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.environment}


@app.post("/api/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    email = payload.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = User(email=email, display_name=payload.display_name.strip(), password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    attach_auth_cookie(response, token)
    return TokenResponse(access_token=token, user=user)


@app.post("/api/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
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


@app.get("/api/transactions", response_model=list[TransactionResponse])
def list_transactions(user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[Transaction]:
    return list(db.scalars(select(Transaction).where(Transaction.user_id == user.id).order_by(Transaction.occurred_on.desc(), Transaction.id.desc())).all())


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
