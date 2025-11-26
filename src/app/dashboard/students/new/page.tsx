import { createClient } from '@/lib/supabase/server'
import { StudentForm } from '@/components/students/student-form'
import { CSVImport } from '@/components/students/csv-import'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function NewStudentPage() {
  const supabase = await createClient()

  // Get courses and instructors for the form
  const [{ data: courses }, { data: instructors }] = await Promise.all([
    supabase.from('courses').select('id, name').order('name'),
    supabase.from('users').select('id, name').eq('role', 'instructor').eq('status', 'active').order('name'),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          受講生 新規登録
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          新しい受講生の情報を登録します
        </p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">個別登録</TabsTrigger>
          <TabsTrigger value="bulk">CSV一括登録</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>
                受講生の基本情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentForm courses={courses || []} instructors={instructors || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="mt-6">
          <CSVImport courses={courses || []} instructors={instructors || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
