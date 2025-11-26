import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { InterviewsTable } from '@/components/interviews/interviews-table'

export default async function InterviewsPage() {
  const supabase = await createClient()

  // Get interviews with student and interviewer info
  const { data: interviews, error } = await supabase
    .from('interviews')
    .select(`
      *,
      student:students(name),
      interviewer:users(name)
    `)
    .order('interview_date', { ascending: false })

  if (error) {
    console.error('Error fetching interviews:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            面談記録
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            受講生との面談記録の一覧・作成
          </p>
        </div>
        <Link href="/dashboard/interviews/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規記録
          </Button>
        </Link>
      </div>

      <InterviewsTable data={interviews || []} />
    </div>
  )
}
