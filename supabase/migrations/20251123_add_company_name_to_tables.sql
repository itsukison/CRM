-- Ensure every logical CRM table has a canonical company_name field available
-- This migration assumes:
--   - Main table metadata is stored in public.tables (JSONB column "columns")
--   - Row data is stored in public.table_rows with JSONB column "data"
--
-- If your schema differs, adapt table / column names accordingly.

-- 1) Add company_name key to existing table row JSON (non-destructive)
UPDATE public.table_rows
SET data = jsonb_set(
    COALESCE(data, '{}'::jsonb),
    '{company_name}',
    to_jsonb(NULL::text),
    true
)
WHERE NOT (data ? 'company_name');

-- 2) Optionally, update metadata in public.tables.columns to include a canonical definition.
--    This is written as a template; adjust to your exact JSON structure if needed.
--
-- UPDATE public.tables
-- SET columns = columns || jsonb_build_object(
--   'id', 'company_name',
--   'name', '会社名',
--   'type', 'text',
--   'description', '企業名 (AIの企業データ取得に使用されます)',
--   'required', false,
--   'order', 0
-- )
-- WHERE NOT (columns::jsonb @> '[{"id": "company_name"}]'::jsonb);


