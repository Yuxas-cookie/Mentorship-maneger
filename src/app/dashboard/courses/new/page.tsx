import { CourseForm } from '@/components/courses/course-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function NewCoursePage() {
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          新規コース作成
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          新しい学習コースを作成します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>コース情報</CardTitle>
          <CardDescription>
            コースの基本情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm />
        </CardContent>
      </Card>
    </div>
  )
}
