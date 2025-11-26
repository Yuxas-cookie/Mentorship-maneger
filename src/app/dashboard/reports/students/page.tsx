import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, MessageSquare, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const statusLabels = {
  active: '在籍中',
  on_leave: '休学中',
  graduated: '卒業',
  withdrawn: '退会',
}

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  on_leave: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  graduated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
}

type StudentProgress = {
  id: string
  name: string
  email: string
  status: 'active' | 'on_leave' | 'graduated' | 'withdrawn'
  course_name: string | null
  interview_count: number
  goal_count: number
  completed_goals: number
  last_interview_date: string | null
  avg_goal_progress: number
}

export default async function StudentProgressReportPage() {
  const supabase = await createClient()

  // Get all students with their stats
  const { data: studentsData } = await supabase
    .from('students')
    .select('id, name, email, status, course:courses(name)')
    .order('name')

  if (!studentsData) {
    return <div>データを読み込めませんでした</div>
  }

  // @ts-ignore - Type assertion for complex Supabase query
  const students = studentsData as Array<any>

  // Get interview counts for each student
  const { data: interviewCountsData } = await supabase
    .from('interviews')
    .select('student_id')

  // @ts-ignore - Type assertion for complex Supabase query
  const interviewCounts = interviewCountsData as Array<any>

  // Get goal stats for each student
  const { data: goalsData } = await supabase
    .from('goals')
    .select('student_id, status, progress_percentage')

  // @ts-ignore - Type assertion for complex Supabase query
  const goals = goalsData as Array<any>

  // Get last interview dates
  const { data: lastInterviewsData } = await supabase
    .from('interviews')
    .select('student_id, interview_date')
    .order('interview_date', { ascending: false })

  // @ts-ignore - Type assertion for complex Supabase query
  const lastInterviews = lastInterviewsData as Array<any>

  // Calculate stats for each student
  const studentProgress: StudentProgress[] = students.map((student) => {
    const studentInterviews = interviewCounts?.filter(i => i.student_id === student.id) || []
    const studentGoals = goals?.filter(g => g.student_id === student.id) || []
    const completedGoals = studentGoals.filter(g => g.status === 'completed').length
    const avgProgress = studentGoals.length > 0
      ? Math.round(studentGoals.reduce((sum, g) => sum + g.progress_percentage, 0) / studentGoals.length)
      : 0
    const lastInterview = lastInterviews?.find(i => i.student_id === student.id)

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      status: student.status,
      // @ts-ignore
      course_name: student.course?.name || null,
      interview_count: studentInterviews.length,
      goal_count: studentGoals.length,
      completed_goals: completedGoals,
      last_interview_date: lastInterview?.interview_date || null,
      avg_goal_progress: avgProgress,
    }
  })

  // Calculate overall stats
  const totalStudents = students.length
  const activeStudents = students.filter(s => s.status === 'active').length
  const totalInterviews = interviewCounts?.length || 0
  const totalGoals = goals?.length || 0
  const completedGoals = goals?.filter(g => g.status === 'completed').length || 0
  const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            受講生進捗レポート
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            各受講生の学習進捗状況を一覧表示
          </p>
        </div>
        <Link href="/dashboard/reports">
          <Button variant="outline">レポート一覧に戻る</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総受講生数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              在籍中: {activeStudents}名
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総面談回数</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInterviews}</div>
            <p className="text-xs text-muted-foreground">
              平均: {totalStudents > 0 ? (totalInterviews / totalStudents).toFixed(1) : 0}回/人
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総目標数</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals}</div>
            <p className="text-xs text-muted-foreground">
              完了: {completedGoals}件
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">目標達成率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goalCompletionRate}%</div>
            <Progress value={goalCompletionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Student Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle>受講生別進捗状況</CardTitle>
          <CardDescription>
            面談回数、目標達成状況、最終面談日を表示
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {studentProgress.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/dashboard/students/${student.id}`}>
                      <h3 className="font-semibold hover:text-blue-600 transition-colors">
                        {student.name}
                      </h3>
                    </Link>
                    <Badge className={statusColors[student.status]} variant="outline">
                      {statusLabels[student.status]}
                    </Badge>
                    {student.course_name && (
                      <span className="text-sm text-muted-foreground">
                        {student.course_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>面談: {student.interview_count}回</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>
                        目標: {student.completed_goals}/{student.goal_count}件完了
                      </span>
                    </div>
                    {student.last_interview_date && (
                      <div>
                        最終面談: {format(new Date(student.last_interview_date), 'PP', { locale: ja })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      平均進捗率
                    </div>
                    <div className="text-2xl font-bold">{student.avg_goal_progress}%</div>
                  </div>
                  <Progress value={student.avg_goal_progress} className="w-24" />
                </div>
              </div>
            ))}
            {studentProgress.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                受講生データがありません
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
