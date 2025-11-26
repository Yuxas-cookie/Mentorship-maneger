import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Target, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const statusLabels = {
  not_started: '未着手',
  in_progress: '進行中',
  completed: '完了',
  cancelled: '中止',
}

const statusColors = {
  not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

const statusIcons = {
  not_started: Clock,
  in_progress: Target,
  completed: CheckCircle,
  cancelled: XCircle,
}

export default async function GoalsReportPage() {
  const supabase = await createClient()

  // Get all goals with student info
  const { data: goalsData } = await supabase
    .from('goals')
    .select(`
      *,
      student:students(name)
    `)
    .order('progress_percentage', { ascending: false })

  if (!goalsData) {
    return <div>データを読み込めませんでした</div>
  }

  // @ts-ignore - Type assertion for complex Supabase query
  const goals = goalsData as Array<any>

  // Calculate statistics
  const totalGoals = goals.length

  // Count by status
  const statusStats = {
    not_started: goals.filter(g => g.status === 'not_started').length,
    in_progress: goals.filter(g => g.status === 'in_progress').length,
    completed: goals.filter(g => g.status === 'completed').length,
    cancelled: goals.filter(g => g.status === 'cancelled').length,
  }

  // Calculate average progress
  const avgProgress = totalGoals > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress_percentage, 0) / totalGoals)
    : 0

  // Calculate completion rate
  const completionRate = totalGoals > 0
    ? Math.round((statusStats.completed / totalGoals) * 100)
    : 0

  // Active goals (not completed or cancelled)
  const activeGoals = goals.filter(g => g.status !== 'completed' && g.status !== 'cancelled')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            目標達成率レポート
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            目標の進捗状況と達成率を分析
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
            <CardTitle className="text-sm font-medium">総目標数</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals}</div>
            <p className="text-xs text-muted-foreground">
              アクティブ: {activeGoals.length}件
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了した目標</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">進行中</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.in_progress}</div>
            <p className="text-xs text-muted-foreground">
              {totalGoals > 0 ? Math.round((statusStats.in_progress / totalGoals) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均進捗率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <Progress value={avgProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>ステータス別内訳</CardTitle>
          <CardDescription>目標のステータスごとの分布</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(statusStats).map(([status, count]) => {
              const Icon = statusIcons[status as keyof typeof statusIcons]
              return (
                <div key={status} className="flex flex-col items-center justify-center p-6 border rounded-lg">
                  <Icon className="h-8 w-8 mb-3 text-muted-foreground" />
                  <Badge
                    className={statusColors[status as keyof typeof statusColors]}
                    variant="outline"
                  >
                    {statusLabels[status as keyof typeof statusLabels]}
                  </Badge>
                  <div className="text-3xl font-bold mt-3">{count}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    ({totalGoals > 0 ? Math.round((count / totalGoals) * 100) : 0}%)
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Goals */}
      <Card>
        <CardHeader>
          <CardTitle>アクティブな目標</CardTitle>
          <CardDescription>進行中・未着手の目標一覧（進捗率順）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge
                      className={statusColors[goal.status as keyof typeof statusColors]}
                      variant="outline"
                    >
                      {statusLabels[goal.status as keyof typeof statusLabels]}
                    </Badge>
                    <h3 className="font-semibold">{goal.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {/* @ts-ignore */}
                    <span>受講生: {goal.student?.name}</span>
                    <span>目標日: {format(new Date(goal.target_date), 'PP', { locale: ja })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold">{goal.progress_percentage}%</div>
                  </div>
                  <Progress value={goal.progress_percentage} className="w-32" />
                </div>
              </div>
            ))}
            {activeGoals.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                アクティブな目標がありません
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed Goals */}
      {statusStats.completed > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>完了した目標</CardTitle>
            <CardDescription>達成済みの目標一覧</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goals
                .filter(g => g.status === 'completed')
                .slice(0, 10)
                .map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50 dark:bg-green-900/10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold">{goal.title}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground ml-8">
                        {/* @ts-ignore */}
                        <span>受講生: {goal.student?.name}</span>
                        <span>達成日: {format(new Date(goal.target_date), 'PP', { locale: ja })}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
