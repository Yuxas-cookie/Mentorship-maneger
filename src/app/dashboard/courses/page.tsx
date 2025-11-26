import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { CoursesTable } from '@/components/courses/courses-table'
import { redirect } from 'next/navigation'

export default async function CoursesPage() {
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

  // Get all courses
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            コース管理
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            学習コースの作成・編集・削除
          </p>
        </div>
        <Link href="/dashboard/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規コース作成
          </Button>
        </Link>
      </div>

      {courses && courses.length > 0 ? (
        <CoursesTable courses={courses} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>コースがありません</CardTitle>
            <CardDescription>
              最初のコースを作成してください
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <Link href="/dashboard/courses/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                コースを作成
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
