-- Run this once before deploying the encryption-enabled backend.
-- It changes sensitive columns to text so they can hold versioned ciphertext.
-- After this migration, run: python -m scripts.backfill_encrypted_data

DO $$
DECLARE
  item record;
BEGIN
  FOR item IN SELECT * FROM (VALUES
    ('users','display_name'),
    ('accounts','name'), ('accounts','account_type'), ('accounts','currency'), ('accounts','opening_balance'),
    ('transactions','transaction_type'), ('transactions','amount'), ('transactions','name'), ('transactions','category'), ('transactions','notes'), ('transactions','occurred_on'),
    ('budgets','category'), ('budgets','monthly_limit'),
    ('loans','name'), ('loans','remaining_balance'), ('loans','minimum_payment'), ('loans','interest_rate'), ('loans','due_date'),
    ('loan_payments','amount'), ('loan_payments','principal_amount'), ('loan_payments','interest_amount'), ('loan_payments','paid_on'), ('loan_payments','note'),
    ('goals','name'), ('goals','target_amount'), ('goals','current_amount'), ('goals','target_date'),
    ('recurring_bills','name'), ('recurring_bills','amount'), ('recurring_bills','category'), ('recurring_bills','frequency'), ('recurring_bills','next_due')
  ) AS columns(table_name, column_name)
  LOOP
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE text USING %I::text', item.table_name, item.column_name, item.column_name);
  END LOOP;
END $$;
