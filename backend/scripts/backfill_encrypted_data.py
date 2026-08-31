"""Encrypt legacy plaintext financial fields after migration 006 is applied."""

from sqlalchemy import select

from app.db import SessionLocal
from app.models import Account, Budget, Goal, Loan, LoanPayment, RecurringBill, Transaction, User


MODELS = (User, Account, Transaction, Budget, Loan, LoanPayment, Goal, RecurringBill)


def main() -> None:
    with SessionLocal() as db:
        for model in MODELS:
            for record in db.scalars(select(model)).all():
                for column in record.__table__.columns:
                    if column.name not in {"id", "email", "password_hash", "user_id", "account_id", "loan_id", "is_archived", "created_at"}:
                        setattr(record, column.name, getattr(record, column.name))
        db.commit()
    print("Encrypted existing financial records.")


if __name__ == "__main__":
    main()
