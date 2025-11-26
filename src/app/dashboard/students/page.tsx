import { createClient } from '@/lib/supabase/server'
import { StudentsTable } from '@/components/students/students-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function StudentsPage() {
  const supabase = await createClient()

  // Get students with course and instructor info
  const { data: students, error } = await supabase
    .from('students')
    .select(`
      *,
      course:courses(name),
      instructor:users!students_assigned_instructor_id_fkey(name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching students:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            受講生管理
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            受講生の一覧・登録・編集
          </p>
        </div>
        <Link href="/dashboard/students/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Button>
        </Link>
      </div>

      <StudentsTable data={students || []} />
    </div>
  )
}
