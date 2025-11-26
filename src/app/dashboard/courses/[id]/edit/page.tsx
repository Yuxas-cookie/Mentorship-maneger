import { CourseForm } from '@/components/courses/course-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import type { Tables } from '@/types/database'

export default async function EditCoursePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Check authentication and admin role
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userDataRaw } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userData = userDataRaw as { role: string } | null

  if (!userData || userData.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get course data
  const { data: courseData, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (error || !courseData) {
    notFound()
  }

  const course = courseData as Tables<'courses'>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          コース編集
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {course.name} の情報を編集します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>コース情報</CardTitle>
          <CardDescription>
            コースの基本情報を編集してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm
            initialData={{
              name: course.name,
              description: course.description || '',
            }}
            courseId={params.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
