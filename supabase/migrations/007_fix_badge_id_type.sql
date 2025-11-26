-- Fix badge_id type from UUID to TEXT
-- The actual data uses string codes like "value_seed" instead of UUIDs

ALTER TABLE public.students
ALTER COLUMN badge_id TYPE TEXT USING badge_id::TEXT;

COMMENT ON COLUMN public.students.badge_id IS '現在のバッジID（コード）';
