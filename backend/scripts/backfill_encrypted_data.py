"""Encrypt legacy plaintext financial fields after migration 006 is applied."""

from app.encryption_backfill import run_encryption_backfill


def main() -> None:
    run_encryption_backfill()
    print("Encrypted existing financial records.")


if __name__ == "__main__":
    main()
