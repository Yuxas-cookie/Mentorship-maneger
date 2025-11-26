import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MessageSquare, Target, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get statistics
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })

  const { count: interviewCount } = await supabase
    .from('interviews')
    .select('*', { count: 'exact', head: true })

  const { count: goalCount } = await supabase
    .from('goals')
    .select('*', { count: 'exact', head: true })

  const stats = [
    {
      name: '受講生数',
      value: studentCount || 0,
      icon: Users,
      description: '登録されている受講生の総数',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      name: '面談記録',
      value: interviewCount || 0,
      icon: MessageSquare,
      description: '記録された面談の総数',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      name: '目標数',
      value: goalCount || 0,
      icon: Target,
      description: '設定されている目標の総数',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      name: '進捗率',
      value: '75%',
      icon: TrendingUp,
      description: '全体の平均進捗率',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          ダッシュボード
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          システムの概要と統計情報
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {stat.name}
              </CardTitle>
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className={`text-3xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近のアクティビティ</CardTitle>
            <CardDescription>最新の更新情報</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              アクティビティがありません
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今後の予定</CardTitle>
            <CardDescription>スケジュールされたイベント</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              予定がありません
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
