-- Auth System: Auto-Refresh, Magic Link Restore, Device Limits, Access Codes
-- Run against your Supabase project via the SQL editor or CLI.

-- 1. Add cid column to purchases (for customer ID lookup)
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS cid text;
CREATE INDEX IF NOT EXISTS idx_purchases_cid ON purchases(cid);

-- 2. Active tokens for device tracking (max 5 per customer)
CREATE TABLE IF NOT EXISTS active_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email text NOT NULL,
  cid text NOT NULL,
  token_uid text NOT NULL UNIQUE,
  device_name text,
  last_seen_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_active_tokens_cid ON active_tokens(cid);

ALTER TABLE active_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON active_tokens FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select" ON active_tokens FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update" ON active_tokens FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete" ON active_tokens FOR DELETE TO anon USING (true);

-- 3. Magic links for restore flow
CREATE TABLE IF NOT EXISTS magic_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);

ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON magic_links FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select" ON magic_links FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update" ON magic_links FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 4. Access codes for free access grants
CREATE TABLE IF NOT EXISTS access_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  note text,
  max_uses int,
  times_used int DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);

ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON access_codes FOR ALL TO anon USING (true) WITH CHECK (true);

-- 5. Code redemption log
CREATE TABLE IF NOT EXISTS code_redemptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id uuid REFERENCES access_codes(id),
  code text NOT NULL,
  token_uid text NOT NULL,
  device_name text,
  redeemed_at timestamptz DEFAULT now()
);

ALTER TABLE code_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON code_redemptions FOR ALL TO anon USING (true) WITH CHECK (true);
