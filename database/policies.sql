-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_interview_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (is_admin());

-- Students policies
CREATE POLICY "Instructors can view assigned students" ON students
  FOR SELECT USING (
    assigned_instructor_id = auth.uid() OR is_admin()
  );

CREATE POLICY "Instructors can update assigned students" ON students
  FOR UPDATE USING (
    assigned_instructor_id = auth.uid() OR is_admin()
  );

CREATE POLICY "Admins can insert students" ON students
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can delete students" ON students
  FOR DELETE USING (is_admin());

-- Interviews policies
CREATE POLICY "View interviews of assigned students" ON interviews
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE assigned_instructor_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Instructors can insert interviews for assigned students" ON interviews
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE assigned_instructor_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Instructors can update own interviews" ON interviews
  FOR UPDATE USING (
    instructor_id = auth.uid() OR is_admin()
  );

CREATE POLICY "Instructors can delete own interviews" ON interviews
  FOR DELETE USING (
    instructor_id = auth.uid() OR is_admin()
  );

-- Evaluations policies (same as interviews)
CREATE POLICY "View evaluations of assigned students" ON evaluations
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE assigned_instructor_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Instructors can insert evaluations" ON evaluations
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE assigned_instructor_id = auth.uid()
    ) OR is_admin()
  );

-- Goals policies
CREATE POLICY "View goals of assigned students" ON goals
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE assigned_instructor_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Instructors can manage goals for assigned students" ON goals
  FOR ALL USING (
    student_id IN (
      SELECT id FROM students WHERE assigned_instructor_id = auth.uid()
    ) OR is_admin()
  );

-- Milestones policies
CREATE POLICY "View milestones of assigned student goals" ON milestones
  FOR SELECT USING (
    goal_id IN (
      SELECT g.id FROM goals g
      JOIN students s ON g.student_id = s.id
      WHERE s.assigned_instructor_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Manage milestones of assigned student goals" ON milestones
  FOR ALL USING (
    goal_id IN (
      SELECT g.id FROM goals g
      JOIN students s ON g.student_id = s.id
      WHERE s.assigned_instructor_id = auth.uid()
    ) OR is_admin()
  );

-- Simple policies for other tables (accessible to all authenticated users)
CREATE POLICY "Authenticated users can view courses" ON courses
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage courses" ON courses
  FOR ALL USING (is_admin());

CREATE POLICY "Authenticated users can view tags" ON tags
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage tags" ON tags
  FOR ALL USING (is_admin());

CREATE POLICY "View student tags for assigned students" ON student_tags
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE assigned_instructor_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Manage student tags for assigned students" ON student_tags
  FOR ALL USING (
    student_id IN (
      SELECT id FROM students WHERE assigned_instructor_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "View interview tags for assigned students" ON interview_tags
  FOR SELECT USING (
    interview_id IN (
      SELECT i.id FROM interviews i
      JOIN students s ON i.student_id = s.id
      WHERE s.assigned_instructor_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Manage interview tags for own interviews" ON interview_tags
  FOR ALL USING (
    interview_id IN (
      SELECT id FROM interviews WHERE instructor_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "View goal interview relations for assigned students" ON goal_interview_relations
  FOR SELECT USING (
    goal_id IN (
      SELECT g.id FROM goals g
      JOIN students s ON g.student_id = s.id
      WHERE s.assigned_instructor_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Manage goal interview relations for assigned students" ON goal_interview_relations
  FOR ALL USING (
    goal_id IN (
      SELECT g.id FROM goals g
      JOIN students s ON g.student_id = s.id
      WHERE s.assigned_instructor_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "View attachments for assigned students" ON attachments
  FOR SELECT USING (
    (related_type = 'student' AND related_id IN (
      SELECT id FROM students WHERE assigned_instructor_id = auth.uid()
    )) OR
    (related_type = 'interview' AND related_id IN (
      SELECT i.id FROM interviews i
      JOIN students s ON i.student_id = s.id
      WHERE s.assigned_instructor_id = auth.uid()
    )) OR
    (related_type = 'goal' AND related_id IN (
      SELECT g.id FROM goals g
      JOIN students s ON g.student_id = s.id
      WHERE s.assigned_instructor_id = auth.uid()
    )) OR
    is_admin()
  );

CREATE POLICY "Upload attachments for assigned students" ON attachments
  FOR INSERT WITH CHECK (
    (related_type = 'student' AND related_id IN (
      SELECT id FROM students WHERE assigned_instructor_id = auth.uid()
    )) OR
    (related_type = 'interview' AND related_id IN (
      SELECT i.id FROM interviews i
      JOIN students s ON i.student_id = s.id
      WHERE s.assigned_instructor_id = auth.uid()
    )) OR
    (related_type = 'goal' AND related_id IN (
      SELECT g.id FROM goals g
      JOIN students s ON g.student_id = s.id
      WHERE s.assigned_instructor_id = auth.uid()
    )) OR
    is_admin()
  );

CREATE POLICY "View interview templates" ON interview_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Manage own interview templates" ON interview_templates
  FOR ALL USING (created_by = auth.uid() OR is_admin());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Storage policies
-- Note: These need to be created through Supabase Dashboard or using storage.objects table
