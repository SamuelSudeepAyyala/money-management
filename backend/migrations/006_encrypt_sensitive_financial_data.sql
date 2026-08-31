-- Run this once before deploying the encryption-enabled backend.
-- It changes sensitive columns to text so they can hold versioned ciphertext.
-- After this migration, run: python -m scripts.backfill_encrypted_data

DO $$
DECLARE
  item record;
BEGIN
  -- Plaintext numeric/frequency checks cannot evaluate ciphertext. API/Pydantic
  -- validation remains the source of truth after this conversion.
  ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_monthly_limit_check;
  ALTER TABLE public.loans DROP CONSTRAINT IF EXISTS loans_remaining_balance_check;
  ALTER TABLE public.loans DROP CONSTRAINT IF EXISTS loans_minimum_payment_check;
  ALTER TABLE public.loans DROP CONSTRAINT IF EXISTS loans_interest_rate_check;
  ALTER TABLE public.loan_payments DROP CONSTRAINT IF EXISTS loan_payments_amount_check;
  ALTER TABLE public.loan_payments DROP CONSTRAINT IF EXISTS loan_payments_principal_amount_check;
  ALTER TABLE public.loan_payments DROP CONSTRAINT IF EXISTS loan_payments_interest_amount_check;
  ALTER TABLE public.loan_payments DROP CONSTRAINT IF EXISTS loan_payment_parts_match;
  ALTER TABLE public.goals DROP CONSTRAINT IF EXISTS goals_target_amount_check;
  ALTER TABLE public.goals DROP CONSTRAINT IF EXISTS goals_current_amount_check;
  ALTER TABLE public.recurring_bills DROP CONSTRAINT IF EXISTS recurring_bills_amount_check;
  ALTER TABLE public.recurring_bills DROP CONSTRAINT IF EXISTS recurring_bills_frequency_check;

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
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I DROP DEFAULT', item.table_name, item.column_name);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE text USING %I::text', item.table_name, item.column_name, item.column_name);
  END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS public.moneyflow_system_state (
  key text PRIMARY KEY,
  completed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.moneyflow_system_state ENABLE ROW LEVEL SECURITY;
