import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Tag, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function TagsPage() {
  const supabase = await createClient()

  // Check authentication and admin role
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userDataRaw } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userData = userDataRaw as { role: string } | null

  if (!userData || userData.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get all tags
  const { data: tagsData } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  // @ts-ignore - Type assertion for complex Supabase query
  const tags = tagsData as Array<any>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            タグ管理
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            タグの作成・編集・削除（今後の機能拡張用）
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          新規タグ作成（準備中）
        </Button>
      </div>

      {tags && tags.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>タグ一覧</CardTitle>
            <CardDescription>
              登録されているタグを表示（{tags.length}件）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" disabled>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" disabled>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>タグがありません</CardTitle>
            <CardDescription>
              タグ機能は今後の拡張機能として準備されています
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              現在タグ機能は実装準備中です
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
