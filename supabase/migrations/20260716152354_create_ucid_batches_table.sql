/*
# Create ucid_batches table for lot traceability

1. New Tables
- `ucid_batches`: Stores production lots/batches for company traceability.
  - `id` (uuid, primary key)
  - `company_id` (uuid, NOT NULL, FK to companies.id) — the company that owns this batch
  - `product_id` (uuid, NOT NULL, FK to products.id) — the product associated with this batch
  - `batch_code` (text, NOT NULL, unique) — unique identifier for the batch
  - `name` (text, NOT NULL) — descriptive name of the batch
  - `quantity` (integer, NOT NULL, default 0) — number of units in the batch
  - `production_date` (date) — when the batch was produced
  - `expiration_date` (date) — expiration date of the batch
  - `status` (batch_status enum, default 'draft') — draft, active, or archived
  - `created_by` (uuid, nullable) — user who created the batch
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `ucid_batches`.
- Allow anon + authenticated CRUD since this app is a no-auth companion tool
  that shares the same Supabase database with the QR generation app.
  Both apps use the anon key to read/write batch data.

3. Indexes
- Index on `company_id` for fast lookups by company.
- Index on `product_id` for fast lookups by product.
- Index on `batch_code` for fast lookups by code.

4. Notes
- This table is designed to be shared between two Bolt apps:
  1. This app: manages batch data and CSV uploads (no QR generation).
  2. The QR app (traceqr): reads batches from this table to generate QR codes.
- Both apps connect to the same Supabase instance, so data is shared automatically.
*/

CREATE TABLE IF NOT EXISTS ucid_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  batch_code text NOT NULL UNIQUE,
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  production_date date,
  expiration_date date,
  status record_status NOT NULL DEFAULT 'active'::record_status,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ucid_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ucid_batches" ON ucid_batches;
CREATE POLICY "anon_select_ucid_batches" ON ucid_batches FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_ucid_batches" ON ucid_batches;
CREATE POLICY "anon_insert_ucid_batches" ON ucid_batches FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_ucid_batches" ON ucid_batches;
CREATE POLICY "anon_update_ucid_batches" ON ucid_batches FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_ucid_batches" ON ucid_batches;
CREATE POLICY "anon_delete_ucid_batches" ON ucid_batches FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_ucid_batches_company_id ON ucid_batches(company_id);
CREATE INDEX IF NOT EXISTS idx_ucid_batches_product_id ON ucid_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_ucid_batches_batch_code ON ucid_batches(batch_code);
