-- Add real_name field to students table
-- name: 表示名・ユーザー名
-- real_name: 本名（任意）

ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS real_name TEXT;

-- Add comment to describe the field
COMMENT ON COLUMN public.students.real_name IS '本名 - 受講生の実名（任意項目）';
