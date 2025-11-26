-- Add vision fields to students table
-- Vision represents what the student wants to become or achieve through the course

ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS vision_title TEXT,
ADD COLUMN IF NOT EXISTS vision_description TEXT,
ADD COLUMN IF NOT EXISTS vision_target_date DATE;

COMMENT ON COLUMN public.students.vision_title IS '将来のビジョン（タイトル）';
COMMENT ON COLUMN public.students.vision_description IS 'ビジョンの詳細説明';
COMMENT ON COLUMN public.students.vision_target_date IS 'ビジョン達成目標時期';
