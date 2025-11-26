-- Add enrollment_date and goals_display fields to students table

ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS enrollment_date DATE,
ADD COLUMN IF NOT EXISTS goals_display TEXT;

-- Add comment to describe the fields
COMMENT ON COLUMN public.students.enrollment_date IS '入会日';
COMMENT ON COLUMN public.students.goals_display IS '目標表示 - 受講生の目標や進捗を表示するためのフィールド';

-- Create index on enrollment_date for better query performance
CREATE INDEX IF NOT EXISTS idx_students_enrollment_date ON public.students(enrollment_date);
