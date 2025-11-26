-- Students indexes
CREATE INDEX idx_students_assigned_instructor ON students(assigned_instructor_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_status_instructor ON students(status, assigned_instructor_id);

-- Interviews indexes
CREATE INDEX idx_interviews_student_date ON interviews(student_id, interview_date DESC);
CREATE INDEX idx_interviews_instructor_date ON interviews(instructor_id, interview_date DESC);
CREATE INDEX idx_interviews_status ON interviews(status);

-- Goals indexes
CREATE INDEX idx_goals_student_status ON goals(student_id, status);
CREATE INDEX idx_goals_due_date ON goals(due_date);
CREATE INDEX idx_goals_student_id ON goals(student_id);

-- Evaluations indexes
CREATE INDEX idx_evaluations_student_evaluated ON evaluations(student_id, evaluated_at DESC);
CREATE INDEX idx_evaluations_interview_id ON evaluations(interview_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
