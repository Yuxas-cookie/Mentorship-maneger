-- Insert sample courses
INSERT INTO public.courses (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Web開発コース', 'HTML, CSS, JavaScriptを学ぶ基礎コース'),
  ('00000000-0000-0000-0000-000000000002', 'フルスタックコース', 'React, Node.js, データベースを学ぶコース'),
  ('00000000-0000-0000-0000-000000000003', 'データサイエンスコース', 'Python, 機械学習、データ分析を学ぶコース')
ON CONFLICT (id) DO NOTHING;

-- Note: User records will be automatically created via trigger when users sign up through Supabase Auth
-- To manually create admin/instructor users, you need to:
-- 1. Sign up through the app (/login > サインアップ)
-- 2. Then update the role in the database:
--    UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
