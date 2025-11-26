import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, Users, MessageSquare, Target, Download } from 'lucide-react'

export default function ReportsPage() {
  const reports = [
    {
      title: '受講生進捗レポート',
      description: '受講生ごとの学習進捗、面談回数、目標達成状況を確認',
      icon: Users,
      href: '/dashboard/reports/students',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: '面談記録サマリー',
      description: '面談の実施状況、種別ごとの統計、月次推移を分析',
      icon: MessageSquare,
      href: '/dashboard/reports/interviews',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: '目標達成率レポート',
      description: '目標のステータス別集計、達成率の推移を可視化',
      icon: Target,
      href: '/dashboard/reports/goals',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            レポート
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            各種レポートと統計情報
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <Link key={report.href} href={report.href}>
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <CardTitle>{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    レポートを見る
                    <FileText className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>データエクスポート</CardTitle>
          <CardDescription>
            すべてのデータをCSV形式でエクスポート
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Link href="/api/export/students" target="_blank">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                受講生データをエクスポート
              </Button>
            </Link>
            <Link href="/api/export/interviews" target="_blank">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                面談記録をエクスポート
              </Button>
            </Link>
            <Link href="/api/export/goals" target="_blank">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                目標データをエクスポート
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            ※ CSV形式でダウンロードされます
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
