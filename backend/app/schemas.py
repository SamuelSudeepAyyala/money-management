from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)
    display_name: str = Field(min_length=1, max_length=120)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    display_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class AccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    account_type: str = Field(default="checking", max_length=40)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    opening_balance: Decimal = Field(default=Decimal("0.00"), max_digits=14, decimal_places=2)


class AccountResponse(AccountCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class TransactionCreate(BaseModel):
    account_id: int
    transaction_type: str = Field(pattern="^(expense|income)$")
    amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    name: str = Field(min_length=1, max_length=160)
    category: str = Field(default="Other", max_length=80)
    notes: str | None = Field(default=None, max_length=2000)
    occurred_on: date = date.today()


class TransactionResponse(TransactionCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class BudgetCreate(BaseModel):
    category: str = Field(min_length=1, max_length=80)
    monthly_limit: Decimal = Field(gt=0, max_digits=14, decimal_places=2)


class BudgetResponse(BudgetCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class LoanCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    remaining_balance: Decimal = Field(ge=0, max_digits=14, decimal_places=2)
    minimum_payment: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=14, decimal_places=2)
    interest_rate: Decimal = Field(default=Decimal("0.000"), ge=0, max_digits=6, decimal_places=3)
    due_date: date | None = None


class LoanResponse(LoanCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class GoalCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    target_amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    current_amount: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=14, decimal_places=2)
    target_date: date | None = None


class GoalResponse(GoalCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
