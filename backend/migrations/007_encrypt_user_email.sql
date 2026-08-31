-- Encrypt user email addresses while keeping a keyed lookup hash for login.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_lookup varchar(64);
DROP INDEX IF EXISTS public.ix_users_email;
ALTER TABLE public.users ALTER COLUMN email TYPE text USING email::text;
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email_lookup ON public.users (email_lookup);
