-- Add goal hierarchy and types
-- Large goal (大目標) = vision in students table
-- Medium goal (中目標) = milestone goals
-- Small goal (小目標) = specific tasks/goals with progress tracking

-- Add goal type and parent relationship
ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS goal_type TEXT DEFAULT 'small' CHECK (goal_type IN ('medium', 'small')),
ADD COLUMN IF NOT EXISTS parent_goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE;

-- Add index for parent_goal_id for performance
CREATE INDEX IF NOT EXISTS idx_goals_parent_goal_id ON public.goals(parent_goal_id);

COMMENT ON COLUMN public.goals.goal_type IS '目標タイプ: medium(中目標), small(小目標)';
COMMENT ON COLUMN public.goals.parent_goal_id IS '親目標ID（中目標の場合はnull、小目標の場合は中目標のID）';

-- Update existing goals to be small goals
UPDATE public.goals SET goal_type = 'small' WHERE goal_type IS NULL;
