from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base
from .encryption import EncryptedDate, EncryptedDecimal, EncryptedString


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(EncryptedString())
    email_lookup: Mapped[str | None] = mapped_column(String(64), unique=True, index=True, nullable=True)
    display_name: Mapped[str] = mapped_column(EncryptedString())
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    accounts: Mapped[list["Account"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    budgets: Mapped[list["Budget"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    loans: Mapped[list["Loan"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    loan_payments: Mapped[list["LoanPayment"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    recurring_bills: Mapped[list["RecurringBill"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    goals: Mapped[list["Goal"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(EncryptedString())
    account_type: Mapped[str] = mapped_column(EncryptedString(), default="checking")
    currency: Mapped[str] = mapped_column(EncryptedString(), default="USD")
    opening_balance: Mapped[Decimal] = mapped_column(EncryptedDecimal(), default=Decimal("0.00"))
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user: Mapped[User] = relationship(back_populates="accounts")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="account")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id", ondelete="CASCADE"), index=True)
    transaction_type: Mapped[str] = mapped_column(EncryptedString())
    amount: Mapped[Decimal] = mapped_column(EncryptedDecimal())
    name: Mapped[str] = mapped_column(EncryptedString())
    category: Mapped[str] = mapped_column(EncryptedString(), default="Other")
    notes: Mapped[str | None] = mapped_column(EncryptedString(), nullable=True)
    occurred_on: Mapped[date] = mapped_column(EncryptedDate(), default=date.today)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user: Mapped[User] = relationship(back_populates="transactions")
    account: Mapped[Account] = relationship(back_populates="transactions")


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    category: Mapped[str] = mapped_column(EncryptedString())
    monthly_limit: Mapped[Decimal] = mapped_column(EncryptedDecimal())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user: Mapped[User] = relationship(back_populates="budgets")


class Loan(Base):
    __tablename__ = "loans"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(EncryptedString())
    remaining_balance: Mapped[Decimal] = mapped_column(EncryptedDecimal())
    minimum_payment: Mapped[Decimal] = mapped_column(EncryptedDecimal(), default=Decimal("0.00"))
    interest_rate: Mapped[Decimal] = mapped_column(EncryptedDecimal(), default=Decimal("0.000"))
    due_date: Mapped[date | None] = mapped_column(EncryptedDate(), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user: Mapped[User] = relationship(back_populates="loans")
    payments: Mapped[list["LoanPayment"]] = relationship(back_populates="loan", cascade="all, delete-orphan")


class LoanPayment(Base):
    __tablename__ = "loan_payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    loan_id: Mapped[int] = mapped_column(ForeignKey("loans.id", ondelete="CASCADE"), index=True)
    amount: Mapped[Decimal] = mapped_column(EncryptedDecimal())
    principal_amount: Mapped[Decimal] = mapped_column(EncryptedDecimal())
    interest_amount: Mapped[Decimal] = mapped_column(EncryptedDecimal(), default=Decimal("0.00"))
    paid_on: Mapped[date] = mapped_column(EncryptedDate(), default=date.today)
    note: Mapped[str | None] = mapped_column(EncryptedString(), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user: Mapped[User] = relationship(back_populates="loan_payments")
    loan: Mapped[Loan] = relationship(back_populates="payments")


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(EncryptedString())
    target_amount: Mapped[Decimal] = mapped_column(EncryptedDecimal())
    current_amount: Mapped[Decimal] = mapped_column(EncryptedDecimal(), default=Decimal("0.00"))
    target_date: Mapped[date | None] = mapped_column(EncryptedDate(), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user: Mapped[User] = relationship(back_populates="goals")


class RecurringBill(Base):
    __tablename__ = "recurring_bills"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(EncryptedString())
    amount: Mapped[Decimal] = mapped_column(EncryptedDecimal())
    category: Mapped[str] = mapped_column(EncryptedString(), default="Other")
    frequency: Mapped[str] = mapped_column(EncryptedString(), default="monthly")
    next_due: Mapped[date] = mapped_column(EncryptedDate())
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user: Mapped[User] = relationship(back_populates="recurring_bills")
