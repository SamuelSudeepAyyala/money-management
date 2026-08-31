from sqlalchemy import select, text
from sqlalchemy.orm.attributes import flag_modified

from .db import SessionLocal
from .models import Account, Budget, Goal, Loan, LoanPayment, RecurringBill, Transaction, User


MODELS = (User, Account, Transaction, Budget, Loan, LoanPayment, Goal, RecurringBill)
SKIP_COLUMNS = {"id", "email", "password_hash", "user_id", "account_id", "loan_id", "is_archived", "created_at"}
MARKER = "sensitive-financial-data-v2"


def run_encryption_backfill() -> None:
    """Encrypt legacy rows once, without exposing a public admin endpoint."""
    with SessionLocal() as db:
        db.execute(text("CREATE TABLE IF NOT EXISTS public.moneyflow_system_state (key text PRIMARY KEY, completed_at timestamptz NOT NULL DEFAULT now())"))
        db.execute(text("ALTER TABLE public.moneyflow_system_state ENABLE ROW LEVEL SECURITY"))
        if db.scalar(select(text("key")).select_from(text("public.moneyflow_system_state")).where(text("key = :key")), {"key": MARKER}):
            db.commit()
            return
        for model in MODELS:
            for record in db.scalars(select(model)).all():
                for column in record.__table__.columns:
                    if column.name not in SKIP_COLUMNS:
                        setattr(record, column.name, getattr(record, column.name))
                        flag_modified(record, column.name)
        db.execute(text("INSERT INTO public.moneyflow_system_state (key) VALUES (:key) ON CONFLICT (key) DO NOTHING"), {"key": MARKER})
        db.commit()
