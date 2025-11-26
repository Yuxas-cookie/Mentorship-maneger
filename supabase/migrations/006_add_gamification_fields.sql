-- Add gamification and Article Platform fields to students table
-- This migration adds all fields from Article Platform CSV export

ALTER TABLE public.students
-- Article Platform User ID (external ID)
ADD COLUMN IF NOT EXISTS external_user_id UUID,

-- Profile
ADD COLUMN IF NOT EXISTS avatar_url TEXT,

-- Points System
ADD COLUMN IF NOT EXISTS current_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_points_earned INTEGER DEFAULT 0,

-- Rank System
ADD COLUMN IF NOT EXISTS current_rank TEXT,
ADD COLUMN IF NOT EXISTS rank_display_name TEXT,
ADD COLUMN IF NOT EXISTS rank_color TEXT,
ADD COLUMN IF NOT EXISTS rank_updated_at TIMESTAMP WITH TIME ZONE,

-- Level System
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_exp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_exp INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS total_exp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level_updated_at TIMESTAMP WITH TIME ZONE,

-- Badge System
ADD COLUMN IF NOT EXISTS badge_id UUID,
ADD COLUMN IF NOT EXISTS badge_name TEXT,
ADD COLUMN IF NOT EXISTS badge_icon TEXT,
ADD COLUMN IF NOT EXISTS badge_color TEXT,
ADD COLUMN IF NOT EXISTS badge_level_up_at TIMESTAMP WITH TIME ZONE,

-- Value Created
ADD COLUMN IF NOT EXISTS total_value_created NUMERIC(15, 2) DEFAULT 0;

-- Add comments to describe the fields
COMMENT ON COLUMN public.students.external_user_id IS 'Article Platformの元のユーザーID';
COMMENT ON COLUMN public.students.avatar_url IS 'プロフィール画像のURL';
COMMENT ON COLUMN public.students.current_points IS '現在のポイント（ランク昇格用）';
COMMENT ON COLUMN public.students.total_points_earned IS '総獲得ポイント';
COMMENT ON COLUMN public.students.current_rank IS '現在のランクコード（例: bronze, silver, gold）';
COMMENT ON COLUMN public.students.rank_display_name IS 'ランクの表示名（例: ブロンズ、シルバー）';
COMMENT ON COLUMN public.students.rank_color IS 'ランクのカラーコード（例: #FFD700）';
COMMENT ON COLUMN public.students.rank_updated_at IS 'ランクが最後に更新された日時';
COMMENT ON COLUMN public.students.level IS '現在のレベル';
COMMENT ON COLUMN public.students.current_exp IS '次のレベルまでの現在経験値';
COMMENT ON COLUMN public.students.max_exp IS '次のレベルに必要な経験値';
COMMENT ON COLUMN public.students.total_exp IS '総獲得経験値';
COMMENT ON COLUMN public.students.level_updated_at IS 'レベルが最後に更新された日時';
COMMENT ON COLUMN public.students.badge_id IS '現在のバッジID';
COMMENT ON COLUMN public.students.badge_name IS 'バッジ名（例: 🔥 ファイアクリエイター）';
COMMENT ON COLUMN public.students.badge_icon IS 'バッジアイコン（絵文字）';
COMMENT ON COLUMN public.students.badge_color IS 'バッジのカラーコード';
COMMENT ON COLUMN public.students.badge_level_up_at IS 'バッジが最後にレベルアップした日時';
COMMENT ON COLUMN public.students.total_value_created IS '創出した総価値（円）';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_external_user_id ON public.students(external_user_id);
CREATE INDEX IF NOT EXISTS idx_students_current_rank ON public.students(current_rank);
CREATE INDEX IF NOT EXISTS idx_students_level ON public.students(level);
CREATE INDEX IF NOT EXISTS idx_students_current_points ON public.students(current_points DESC);
CREATE INDEX IF NOT EXISTS idx_students_total_points_earned ON public.students(total_points_earned DESC);
