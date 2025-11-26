import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Calendar, User, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const interviewTypeLabels = {
  regular: '定期面談',
  emergency: '緊急面談',
  career: 'キャリア相談',
  other: 'その他',
}

const interviewTypeColors = {
  regular: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  emergency: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  career: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
}

export default async function InterviewReportPage() {
  const supabase = await createClient()

  // Get all interviews with related data
  const { data: interviewsData } = await supabase
    .from('interviews')
    .select(`
      *,
      student:students(name),
      interviewer:users!interviews_interviewer_id_fkey(name)
    `)
    .order('interview_date', { ascending: false })

  if (!interviewsData) {
    return <div>データを読み込めませんでした</div>
  }

  // @ts-ignore - Type assertion for complex Supabase query
  const interviews = interviewsData as Array<any>

  // Calculate statistics
  const totalInterviews = interviews.length

  // Count by type
  const typeStats = {
    regular: interviews.filter(i => i.interview_type === 'regular').length,
    emergency: interviews.filter(i => i.interview_type === 'emergency').length,
    career: interviews.filter(i => i.interview_type === 'career').length,
    other: interviews.filter(i => i.interview_type === 'other').length,
  }

  // Count by interviewer
  const interviewerStats = interviews.reduce((acc, interview) => {
    const interviewerName = interview.interviewer?.name || '不明'
    acc[interviewerName] = (acc[interviewerName] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Get recent interviews
  const recentInterviews = interviews.slice(0, 10)

  // Calculate average per month (simplified)
  const avgPerMonth = totalInterviews > 0 ? (totalInterviews / 3).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            面談記録サマリー
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            面談の実施状況と統計情報
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
            <CardTitle className="text-sm font-medium">総面談回数</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInterviews}</div>
            <p className="text-xs text-muted-foreground">
              全期間の合計
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月平均</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerMonth}</div>
            <p className="text-xs text-muted-foreground">
              回/月
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">定期面談</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeStats.regular}</div>
            <p className="text-xs text-muted-foreground">
              {totalInterviews > 0 ? Math.round((typeStats.regular / totalInterviews) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">緊急面談</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeStats.emergency}</div>
            <p className="text-xs text-muted-foreground">
              {totalInterviews > 0 ? Math.round((typeStats.emergency / totalInterviews) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interview Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>面談種別内訳</CardTitle>
          <CardDescription>面談タイプごとの実施状況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(typeStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge
                    className={interviewTypeColors[type as keyof typeof interviewTypeColors]}
                    variant="outline"
                  >
                    {interviewTypeLabels[type as keyof typeof interviewTypeLabels]}
                  </Badge>
                  <span className="text-2xl font-bold">{count}件</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {totalInterviews > 0 ? Math.round((count / totalInterviews) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interviewer Stats */}
      <Card>
        <CardHeader>
          <CardTitle>講師別面談回数</CardTitle>
          <CardDescription>各講師が実施した面談の回数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(interviewerStats)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([name, count]) => {
                const countNum = count as number
                return (
                  <div key={name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold">{countNum}回</span>
                      <span className="text-sm text-muted-foreground">
                        ({totalInterviews > 0 ? Math.round((countNum / totalInterviews) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                )
              })}
            {Object.keys(interviewerStats).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                データがありません
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Interviews */}
      <Card>
        <CardHeader>
          <CardTitle>最近の面談記録</CardTitle>
          <CardDescription>直近10件の面談記録</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentInterviews.map((interview) => (
              <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge
                      className={interviewTypeColors[interview.interview_type as keyof typeof interviewTypeColors]}
                      variant="outline"
                    >
                      {interviewTypeLabels[interview.interview_type as keyof typeof interviewTypeLabels]}
                    </Badge>
                    {/* @ts-ignore */}
                    <span className="font-medium">{interview.student?.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {interview.summary}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-medium">
                    {format(new Date(interview.interview_date), 'PP', { locale: ja })}
                  </div>
                  {/* @ts-ignore */}
                  <div className="text-xs text-muted-foreground">
                    {interview.interviewer?.name}
                  </div>
                </div>
              </div>
            ))}
            {recentInterviews.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                面談記録がありません
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
