import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { GoalsTable } from '@/components/goals/goals-table'

export default async function GoalsPage() {
  const supabase = await createClient()

  // Get all goals
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('*')
    .order('goal_type', { ascending: false })
    .order('created_at', { ascending: false })

  if (goalsError) {
    console.error('Error fetching goals:', goalsError)
  }

  // Get all students
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id, name, real_name')

  // Manually join data
  const displayGoals = goals?.map(goal => {
    const student = students?.find(s => s.id === goal.student_id)
    const parentGoal = goals?.find(g => g.id === goal.parent_goal_id)

    return {
      ...goal,
      student: student ? { name: student.name, real_name: student.real_name } : null,
      parent_goal: parentGoal ? { title: parentGoal.title } : null
    }
  }) || []

  // Sort by student name, then by goal type (medium first, then small)
  displayGoals.sort((a, b) => {
    // Primary sort: by student name
    const studentA = a.student?.real_name || a.student?.name || ''
    const studentB = b.student?.real_name || b.student?.name || ''
    const studentCompare = studentA.localeCompare(studentB, 'ja')

    if (studentCompare !== 0) {
      return studentCompare
    }

    // Secondary sort: by goal type (medium before small)
    const goalTypeOrder = { medium: 0, small: 1 }
    const typeA = goalTypeOrder[a.goal_type as 'medium' | 'small'] ?? 2
    const typeB = goalTypeOrder[b.goal_type as 'medium' | 'small'] ?? 2

    return typeA - typeB
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            目標管理
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            受講生の学習目標の一覧・設定（{displayGoals?.length || 0}件）
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/goals/vision/new">
            <Button variant="outline" className="border-blue-500 text-blue-700 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950">
              <Plus className="mr-2 h-4 w-4" />
              ビジョンを設定
            </Button>
          </Link>
          <Link href="/dashboard/goals/new?type=medium">
            <Button variant="outline" className="border-purple-500 text-purple-700 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950">
              <Plus className="mr-2 h-4 w-4" />
              中目標を追加
            </Button>
          </Link>
          <Link href="/dashboard/goals/new?type=small">
            <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-700">
              <Plus className="mr-2 h-4 w-4" />
              小目標を追加
            </Button>
          </Link>
        </div>
      </div>

      <GoalsTable data={displayGoals} />
    </div>
  )
}
