# Financial data encryption

MoneyFlow encrypts sensitive financial and descriptive fields in the backend before they are written to the database using AES-256-GCM. Configure `MONEYFLOW_ENCRYPTION_KEY` only in the backend environment; never commit it or expose it to the frontend.

Generate a key locally:

```bash
python -c "import base64, os; print(base64.urlsafe_b64encode(os.urandom(32)).decode())"
```

For an existing Supabase database, apply `migrations/006_encrypt_sensitive_financial_data.sql` once, configure the same key in the backend, then run this from the `backend` directory:

```bash
python -m scripts.backfill_encrypted_data
```

The email remains plaintext because login and uniqueness checks require exact lookup. Passwords remain one-way Argon2id hashes. Database views and backups show ciphertext; the authenticated backend decrypts values only after ownership checks.
