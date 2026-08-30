import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ["DATABASE_URL"] = "sqlite:///./test_moneyflow.db"
os.environ["JWT_SECRET"] = "test-secret-that-is-long-enough"

from fastapi.testclient import TestClient

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
    transaction = client.post("/api/transactions", headers=headers, json={"account_id": account_id, "transaction_type": "expense", "amount": "12.50", "name": "Coffee", "category": "Food"})
    assert transaction.status_code == 201
    assert len(client.get("/api/transactions", headers=headers).json()) == 1
    assert client.get("/api/me").json()["email"] == "sam@example.com"
    assert client.delete(f"/api/transactions/{transaction.json()['id']}", headers=headers).status_code == 204
    assert client.get("/api/transactions", headers=headers).json() == []

    second = client.post("/api/auth/register", json={"email": "friend@example.com", "display_name": "Friend", "password": "another-strong-password"})
    friend_token = second.json()["access_token"]
    assert client.get("/api/transactions", headers={"Authorization": f"Bearer {friend_token}"}).json() == []


def test_bad_password_is_rejected() -> None:
    response = client.post("/api/auth/login", json={"email": "sam@example.com", "password": "wrong-password"})
    assert response.status_code == 401
