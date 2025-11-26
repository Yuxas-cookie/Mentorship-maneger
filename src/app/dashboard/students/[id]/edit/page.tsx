import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StudentForm } from '@/components/students/student-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Tables } from '@/types/database'

export default async function EditStudentPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Get student data
  const { data: studentData, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (error || !studentData) {
    notFound()
  }

  const student = studentData as Tables<'students'>

  // Get courses and instructors for the form
  const [{ data: courses }, { data: instructors }] = await Promise.all([
    supabase.from('courses').select('id, name').order('name'),
    supabase.from('users').select('id, name').eq('role', 'instructor').eq('status', 'active').order('name'),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          受講生編集
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {student.name} の情報を編集します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>
            受講生の基本情報を編集してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentForm
            courses={courses || []}
            instructors={instructors || []}
            initialData={{
              real_name: student.real_name || '',
              name: student.name,
              email: student.email || '',
              phone: student.phone || '',
              enrollment_date: student.enrollment_date || '',
              goals_display: student.goals_display || '',
              vision_title: student.vision_title || '',
              vision_description: student.vision_description || '',
              vision_target_date: student.vision_target_date || '',
              course_id: student.course_id || '',
              assigned_instructor_id: student.assigned_instructor_id || '',
              status: student.status as 'active' | 'on_leave' | 'graduated' | 'withdrawn',
              notes: student.notes || '',
            }}
            studentId={params.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
