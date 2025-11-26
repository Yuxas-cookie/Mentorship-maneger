import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Database, Shield, Bell, Palette } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()

  // Check authentication and admin role
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userDataRaw } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const userData = userDataRaw as { role: string } | null

  if (!userData || userData.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get system stats
  const [
    { count: studentsCount },
    { count: interviewsCount },
    { count: goalsCount },
    { count: coursesCount },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('interviews').select('*', { count: 'exact', head: true }),
    supabase.from('goals').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
  ])

  const settingsSections = [
    {
      title: 'データベース統計',
      description: 'システム内のデータ統計',
      icon: Database,
      items: [
        { label: '総受講生数', value: `${studentsCount || 0}名` },
        { label: '総面談記録数', value: `${interviewsCount || 0}件` },
        { label: '総目標数', value: `${goalsCount || 0}件` },
        { label: 'コース数', value: `${coursesCount || 0}件` },
      ],
    },
    {
      title: 'セキュリティ',
      description: 'アクセス制御とセキュリティ設定',
      icon: Shield,
      items: [
        { label: '認証方式', value: 'Supabase Auth' },
        { label: 'セッション管理', value: '有効' },
        { label: 'RLS（Row Level Security）', value: '有効' },
      ],
    },
    {
      title: '通知設定',
      description: '将来の機能拡張用（準備中）',
      icon: Bell,
      items: [
        { label: 'メール通知', value: '準備中', badge: 'coming-soon' },
        { label: 'プッシュ通知', value: '準備中', badge: 'coming-soon' },
      ],
    },
    {
      title: 'テーマ設定',
      description: 'UIカスタマイズ（準備中）',
      icon: Palette,
      items: [
        { label: 'ダークモード', value: '準備中', badge: 'coming-soon' },
        { label: 'カラースキーム', value: '準備中', badge: 'coming-soon' },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          システム設定
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          システムの設定と情報を表示
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {settingsSections.map((section) => {
          const Icon = section.icon
          return (
            <Card key={section.title}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items.map((item) => {
                    const hasBadge = 'badge' in item && item.badge === 'coming-soon'
                    return (
                      <div
                        key={item.label}
                        className="flex items-center justify-between py-2 border-b last:border-b-0"
                      >
                        <span className="text-sm font-medium text-muted-foreground">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{item.value}</span>
                          {hasBadge && (
                            <Badge variant="outline" className="text-xs">
                              準備中
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>システム情報</CardTitle>
          <CardDescription>アプリケーションの詳細情報</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium text-muted-foreground">
                アプリケーション名
              </span>
              <span className="text-sm font-semibold">Mentorship Manager</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium text-muted-foreground">
                バージョン
              </span>
              <span className="text-sm font-semibold">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium text-muted-foreground">
                技術スタック
              </span>
              <span className="text-sm font-semibold">Next.js 14 + Supabase</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-muted-foreground">
                最終ビルド
              </span>
              <span className="text-sm font-semibold">
                {new Date().toLocaleDateString('ja-JP')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
