-- Money Planner — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query → Run

-- ============================================================
-- 1. USER DATA TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_data (
  user_id    TEXT        PRIMARY KEY,
  content    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. RECEIPTS STORAGE BUCKET (private)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- Restricts access to the two known household user IDs.
-- NOTE: This limits exposure but is NOT cryptographically
-- verified — the app currently uses PIN auth, not Supabase Auth.
-- Upgrade path: replace policies with auth.uid()::text = user_id
-- once Supabase Auth (magic link / OAuth) is integrated.
-- ============================================================
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "household_select" ON public.user_data;
DROP POLICY IF EXISTS "household_insert" ON public.user_data;
DROP POLICY IF EXISTS "household_update" ON public.user_data;

CREATE POLICY "household_select" ON public.user_data
  FOR SELECT USING (user_id IN ('steven', 'girl'));

CREATE POLICY "household_insert" ON public.user_data
  FOR INSERT WITH CHECK (user_id IN ('steven', 'girl'));

CREATE POLICY "household_update" ON public.user_data
  FOR UPDATE
  USING (user_id IN ('steven', 'girl'))
  WITH CHECK (user_id IN ('steven', 'girl'));

-- ============================================================
-- 4. RECEIPT STORAGE POLICIES
-- ============================================================
DROP POLICY IF EXISTS "receipts_select" ON storage.objects;
DROP POLICY IF EXISTS "receipts_insert" ON storage.objects;

CREATE POLICY "receipts_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'receipts');

CREATE POLICY "receipts_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'receipts');

-- ============================================================
-- 5. AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.user_data;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_data
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
