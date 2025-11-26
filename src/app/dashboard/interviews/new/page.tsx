import { createClient } from '@/lib/supabase/server'
import { InterviewForm } from '@/components/interviews/interview-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function NewInterviewPage() {
  const supabase = await createClient()

  // Get active students
  const { data: students } = await supabase
    .from('students')
    .select('id, name, real_name')
    .eq('status', 'active')
    .order('name')

  // Get current user for interviewer_id
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          面談記録 新規作成
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          受講生との面談内容を記録します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>面談情報</CardTitle>
          <CardDescription>
            面談の内容を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InterviewForm students={students || []} interviewerId={user?.id || ''} />
        </CardContent>
      </Card>
    </div>
  )
}
