ALTER TABLE recurring_bills
  ADD COLUMN IF NOT EXISTS last_status TEXT;

ALTER TABLE recurring_bills
  ADD COLUMN IF NOT EXISTS last_occurrence TEXT;
