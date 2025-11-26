import { createClient } from '@/lib/supabase/server'
import { GoalForm } from '@/components/goals/goal-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function NewGoalPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  const supabase = await createClient()

  // Get goal type from query params
  const goalType = searchParams.type === 'medium' ? 'medium' : 'small'

  // Get active students
  const { data: students } = await supabase
    .from('students')
    .select('id, name, real_name')
    .eq('status', 'active')
    .order('name')

  // Get all medium goals for parent goal selection
  const { data: mediumGoals } = await supabase
    .from('goals')
    .select('id, title, student_id')
    .eq('goal_type', 'medium')
    .order('created_at', { ascending: false })

  const goalTypeLabel = goalType === 'medium' ? '中目標' : '小目標'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {goalTypeLabel} 新規作成
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {goalType === 'medium'
            ? 'マイルストーンとなる中目標を設定します'
            : '具体的なタスクとして小目標を設定します'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{goalTypeLabel}の情報</CardTitle>
          <CardDescription>
            目標の内容を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoalForm
            students={students || []}
            mediumGoals={mediumGoals || []}
            initialData={{ goal_type: goalType }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
