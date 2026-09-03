import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ["DATABASE_URL"] = "sqlite:///./test_moneyflow.db"
os.environ["JWT_SECRET"] = "test-secret-that-is-long-enough"

from fastapi.testclient import TestClient
from sqlalchemy import text

from app.db import Base, engine
from app.main import app


Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
client = TestClient(app)


def test_register_login_and_private_records() -> None:
    first = client.post("/api/auth/register", json={"email": "sam@example.com", "display_name": "Sam", "password": "a-strong-password-123"})
    assert first.status_code == 201
    token = first.json()["access_token"]
    assert "moneyflow_access_token=" in first.headers["set-cookie"]
    headers = {"Authorization": f"Bearer {token}"}

    account = client.post("/api/accounts", headers=headers, json={"name": "Checking", "account_type": "checking", "currency": "USD", "opening_balance": "100.00"})
    assert account.status_code == 201
    account_id = account.json()["id"]
    updated_account = client.put(f"/api/accounts/{account_id}", headers=headers, json={"name": "Primary checking", "account_type": "checking", "currency": "USD", "opening_balance": "125.00"})
    assert updated_account.status_code == 200
    assert updated_account.json()["name"] == "Primary checking"
    with engine.connect() as connection:
        raw_account = connection.execute(text("SELECT name, opening_balance FROM accounts WHERE id = :id"), {"id": account_id}).one()
        assert raw_account.name.startswith("v1:")
        assert raw_account.opening_balance.startswith("v1:")
    transaction = client.post("/api/transactions", headers=headers, json={"account_id": account_id, "transaction_type": "expense", "amount": "12.50", "name": "Coffee", "category": "Food & groceries"})
    assert transaction.status_code == 201
    assert len(client.get("/api/transactions", headers=headers).json()) == 1
    edited_transaction = client.put(f"/api/transactions/{transaction.json()['id']}", headers=headers, json={"account_id": account_id, "transaction_type": "expense", "amount": "15.25", "name": "Updated coffee", "category": "Dining out", "notes": "Corrected amount", "occurred_on": "2026-09-02"})
    assert edited_transaction.status_code == 200
    assert edited_transaction.json()["name"] == "Updated coffee"
    assert edited_transaction.json()["amount"] == "15.25"
    with engine.connect() as connection:
        raw_transaction = connection.execute(text("SELECT amount, name FROM transactions WHERE account_id = :id"), {"id": account_id}).one()
        assert raw_transaction.amount.startswith("v1:")
        assert raw_transaction.name.startswith("v1:")
    assert client.get("/api/me").json()["email"] == "sam@example.com"
    assert client.delete(f"/api/transactions/{transaction.json()['id']}", headers=headers).status_code == 204
    assert client.get("/api/transactions", headers=headers).json() == []

    second = client.post("/api/auth/register", json={"email": "friend@example.com", "display_name": "Friend", "password": "another-strong-password"})
    friend_token = second.json()["access_token"]
    assert client.get("/api/transactions", headers={"Authorization": f"Bearer {friend_token}"}).json() == []

    budget = client.post("/api/budgets", headers=headers, json={"category": "Food", "monthly_limit": "400.00"})
    loan = client.post("/api/loans", headers=headers, json={"name": "Student loan", "remaining_balance": "15000.00", "minimum_payment": "223.67", "interest_rate": "11.740", "due_date": "2026-09-11"})
    goal = client.post("/api/goals", headers=headers, json={"name": "Emergency fund", "target_amount": "5000.00", "current_amount": "500.00"})
    assert budget.status_code == 201 and loan.status_code == 201 and goal.status_code == 201
    assert len(client.get("/api/budgets", headers=headers).json()) == 1
    assert len(client.get("/api/loans", headers=headers).json()) == 1
    assert len(client.get("/api/goals", headers=headers).json()) == 1
    friend_headers = {"Authorization": f"Bearer {friend_token}"}
    assert client.get("/api/budgets", headers=friend_headers).json() == []
    assert client.get("/api/loans", headers=friend_headers).json() == []
    assert client.get("/api/goals", headers=friend_headers).json() == []
    assert client.put(f"/api/budgets/{budget.json()['id']}", headers=headers, json={"category": "Housing", "monthly_limit": "450.00"}).status_code == 200
    assert client.put(f"/api/loans/{loan.json()['id']}", headers=headers, json={"name": "Updated student loan", "remaining_balance": "15000.00", "minimum_payment": "223.67", "interest_rate": "11.740", "due_date": "2026-09-12"}).status_code == 200
    assert client.put(f"/api/goals/{goal.json()['id']}", headers=headers, json={"name": "Updated emergency fund", "target_amount": "6000.00", "current_amount": "500.00"}).status_code == 200
    loan_id = loan.json()["id"]
    payment = client.post(f"/api/loans/{loan_id}/payments", headers=headers, json={"amount": "223.67", "principal_amount": "180.00", "interest_amount": "43.67", "paid_on": "2026-09-11"})
    assert payment.status_code == 201
    assert len(client.get(f"/api/loans/{loan_id}/payments", headers=headers).json()) == 1
    assert client.get(f"/api/loans/{loan_id}/payments", headers=friend_headers).status_code == 404
    assert client.delete(f"/api/loans/{loan_id}/payments/{payment.json()['id']}", headers=headers).status_code == 204
    assert client.delete(f"/api/budgets/{budget.json()['id']}", headers=headers).status_code == 204
    assert client.delete(f"/api/loans/{loan.json()['id']}", headers=headers).status_code == 204
    assert client.delete(f"/api/goals/{goal.json()['id']}", headers=headers).status_code == 204
    bill = client.post("/api/recurring-bills", headers=headers, json={"name": "Rent", "amount": "1450.00", "category": "Housing", "frequency": "monthly", "next_due": "2026-09-15"})
    assert bill.status_code == 201
    assert len(client.get("/api/recurring-bills", headers=headers).json()) == 1
    assert client.get("/api/recurring-bills", headers=friend_headers).json() == []
    paid = client.post(f"/api/recurring-bills/{bill.json()['id']}/pay", headers=headers, json={"account_id": account_id, "occurred_on": "2026-09-15"})
    assert paid.status_code == 200 and paid.json()["next_due"] == "2026-10-15"
    assert client.get("/api/transactions", headers=headers).json()[0]["name"] == "Rent"
    assert client.put(f"/api/recurring-bills/{bill.json()['id']}", headers=headers, json={"name": "Updated rent", "amount": "1500.00", "category": "Housing", "frequency": "monthly", "next_due": "2026-09-16"}).status_code == 200
    skipped = client.post(f"/api/recurring-bills/{bill.json()['id']}/status", headers=headers, json={"status": "skipped", "occurrence_on": "2026-09-16", "next_due": "2026-09-17"})
    assert skipped.status_code == 200 and skipped.json()["last_status"] == "skipped"
    assert client.post(f"/api/recurring-bills/{bill.json()['id']}/status", headers=headers, json={"status": "postponed", "occurrence_on": "2026-09-16", "next_due": "2026-09-23"}).status_code == 409
    assert client.delete(f"/api/recurring-bills/{bill.json()['id']}", headers=headers).status_code == 204


def test_bad_password_is_rejected() -> None:
    response = client.post("/api/auth/login", json={"email": "sam@example.com", "password": "wrong-password"})
    assert response.status_code == 401
