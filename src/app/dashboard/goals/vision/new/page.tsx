import { createClient } from '@/lib/supabase/server'
import { VisionForm } from '@/components/goals/vision-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function NewVisionPage() {
  const supabase = await createClient()

  // Get active students
  const { data: students } = await supabase
    .from('students')
    .select('id, name, real_name, vision_title, vision_description, vision_target_date')
    .eq('status', 'active')
    .order('name')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          ビジョン（大目標）設定
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          受講生の将来のビジョンや目指す姿を設定します
        </p>
      </div>

      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-700 dark:text-blue-400">ビジョン情報</CardTitle>
          <CardDescription>
            講座を通して実現したいことや、将来なりたい姿を記入してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VisionForm students={students || []} />
        </CardContent>
      </Card>
    </div>
  )
}
