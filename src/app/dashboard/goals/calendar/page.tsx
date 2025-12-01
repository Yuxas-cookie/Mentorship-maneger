import { createClient } from '@/lib/supabase/server'
import { GoalsCalendar } from '@/components/goals/goals-calendar'

export default async function GoalsCalendarPage() {
  const supabase = await createClient()

  // Get all goals
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('*')
    .order('target_date', { ascending: true })

  if (goalsError) {
    console.error('Error fetching goals:', goalsError)
  }

  // Get all students
  const { data: students } = await supabase
    .from('students')
    .select('id, name, real_name')

  // Manually join data and filter valid goals
  const goalsWithStudents = goals?.map(goal => {
    const student = students?.find(s => s.id === goal.student_id)

    return {
      ...goal,
      student: student ? { name: student.name, real_name: student.real_name } : null,
    }
  })
    .filter((goal): goal is typeof goal & {
      target_date: string;
      goal_type: 'medium' | 'small';
      title: string;
      status: string;
      progress_percentage: number;
    } => {
      return (
        goal.target_date !== null &&
        goal.title !== null &&
        (goal.goal_type === 'medium' || goal.goal_type === 'small') &&
        goal.status !== null &&
        goal.progress_percentage !== null
      )
    }) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          目標カレンダー
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          全受講生の目標期限を一覧で確認できます
        </p>
      </div>

      <GoalsCalendar goals={goalsWithStudents} />
    </div>
  )
}
