import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Edit, Mail, Phone, User, BookOpen, Calendar, Award, TrendingUp, Target, Star } from 'lucide-react'
import Link from 'next/link'
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

type StudentDetail = {
  id: string
  external_user_id: string | null
  real_name: string | null
  name: string
  email: string
  phone: string | null
  enrollment_date: string | null
  avatar_url: string | null
  goals_display: string | null
  vision_title: string | null
  vision_description: string | null
  vision_target_date: string | null
  status: 'active' | 'on_leave' | 'graduated' | 'withdrawn'
  notes: string | null
  created_at: string
  course: { name: string } | null
  instructor: { name: string; email: string } | null
  // Gamification fields
  level: number | null
  current_exp: number | null
  max_exp: number | null
  total_exp: number | null
  level_updated_at: string | null
  current_points: number | null
  total_points_earned: number | null
  current_rank: string | null
  rank_display_name: string | null
  rank_color: string | null
  rank_updated_at: string | null
  badge_id: string | null
  badge_name: string | null
  badge_icon: string | null
  badge_color: string | null
  badge_level_up_at: string | null
  total_value_created: number | null
}

export default async function StudentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: studentData, error } = await supabase
    .from('students')
    .select(`
      *,
      course:courses(name),
      instructor:users!students_assigned_instructor_id_fkey(name, email)
    `)
    .eq('id', params.id)
    .maybeSingle()

  if (error || !studentData) {
    notFound()
  }

  const student = studentData as unknown as StudentDetail

  // Get student's goals
  const { data: goals } = await supabase
    .from('goals')
    .select(`
      *,
      parent_goal:goals!goals_parent_goal_id_fkey(title)
    `)
    .eq('student_id', params.id)
    .order('goal_type', { ascending: false })
    .order('created_at', { ascending: false })

  // Separate medium and small goals
  const mediumGoals = goals?.filter(g => g.goal_type === 'medium') || []
  const smallGoals = goals?.filter(g => g.goal_type === 'small') || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            受講生詳細
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            受講生の詳細情報
          </p>
        </div>
        <Link href={`/dashboard/students/${params.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            編集
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.real_name && (
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">本名</p>
                  <p className="text-lg font-semibold">{student.real_name}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {student.real_name ? 'ユーザー名' : '氏名'}
                </p>
                <p className="text-lg font-semibold">{student.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">メールアドレス</p>
                <p className="text-base">{student.email}</p>
              </div>
            </div>

            {student.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">電話番号</p>
                  <p className="text-base">{student.phone}</p>
                </div>
              </div>
            )}

            {student.enrollment_date && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">入会日</p>
                  <p className="text-base">
                    {format(new Date(student.enrollment_date), 'PPP', { locale: ja })}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">登録日</p>
                <p className="text-base">
                  {format(new Date(student.created_at), 'PPP', { locale: ja })}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">ステータス</p>
              <Badge className={statusColors[student.status]} variant="outline">
                {statusLabels[student.status]}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>学習情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">コース</p>
                <p className="text-base">{student.course?.name || '未設定'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">担当講師</p>
                <p className="text-base">{student.instructor?.name || '未割当'}</p>
                {student.instructor?.email && (
                  <p className="text-sm text-muted-foreground">{student.instructor.email}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gamification Stats */}
        {(student.level || student.rank_display_name || student.current_points !== null) && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  レベル & 経験値
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {student.level && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        Lv. {student.level}
                      </span>
                      {student.total_exp && (
                        <span className="text-sm text-muted-foreground">
                          総経験値: {student.total_exp.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {student.current_exp !== null && student.max_exp && (
                      <div>
                        <Progress value={(student.current_exp / student.max_exp) * 100} />
                        <p className="text-xs text-muted-foreground mt-1">
                          {student.current_exp} / {student.max_exp} EXP
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  ランク & ポイント
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {student.rank_display_name && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">現在のランク</p>
                    <Badge
                      style={{ backgroundColor: student.rank_color || undefined }}
                      className="text-white text-lg px-4 py-2"
                    >
                      {student.rank_display_name}
                    </Badge>
                  </div>
                )}
                {student.current_points !== null && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">現在のポイント</p>
                    <p className="text-2xl font-bold">
                      {student.current_points.toLocaleString()}
                    </p>
                  </div>
                )}
                {student.total_points_earned !== null && student.total_points_earned > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">総獲得ポイント</p>
                    <p className="text-lg font-semibold">
                      {student.total_points_earned.toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {student.badge_name && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                バッジ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {student.badge_icon && (
                  <span className="text-5xl">{student.badge_icon}</span>
                )}
                <div>
                  <p className="text-xl font-semibold">{student.badge_name}</p>
                  {student.badge_level_up_at && (
                    <p className="text-sm text-muted-foreground">
                      取得日: {format(new Date(student.badge_level_up_at), 'PPP', { locale: ja })}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {student.total_value_created !== null && student.total_value_created > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                創出価値
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                ¥{student.total_value_created.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                システムツール記事で創出した累計価値
              </p>
            </CardContent>
          </Card>
        )}

        {student.goals_display && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>目標</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base whitespace-pre-wrap">{student.goals_display}</p>
            </CardContent>
          </Card>
        )}

        {(student.vision_title || student.vision_description) && (
          <Card className="md:col-span-2 border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Star className="h-5 w-5" />
                将来のビジョン
              </CardTitle>
              {student.vision_target_date && (
                <CardDescription>
                  目標時期: {format(new Date(student.vision_target_date), 'PPP', { locale: ja })}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {student.vision_title && (
                <div>
                  <p className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                    {student.vision_title}
                  </p>
                </div>
              )}
              {student.vision_description && (
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-base whitespace-pre-wrap">
                    {student.vision_description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {student.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>備考</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base whitespace-pre-wrap">{student.notes}</p>
            </CardContent>
          </Card>
        )}

        {(student.vision_title || mediumGoals.length > 0 || smallGoals.length > 0) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                目標の階層構造
              </CardTitle>
              <CardDescription>
                大目標（ビジョン）→ 中目標 → 小目標
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 大目標（ビジョン） */}
              {student.vision_title && (
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-500 text-white">大目標</Badge>
                    <span className="font-semibold text-lg">{student.vision_title}</span>
                  </div>
                  {student.vision_description && (
                    <p className="text-sm text-muted-foreground ml-2">
                      {student.vision_description}
                    </p>
                  )}
                  {student.vision_target_date && (
                    <p className="text-xs text-muted-foreground mt-1 ml-2">
                      目標時期: {format(new Date(student.vision_target_date), 'PPP', { locale: ja })}
                    </p>
                  )}
                </div>
              )}

              {/* 中目標 */}
              {mediumGoals.length > 0 && (
                <div className="space-y-4">
                  {mediumGoals.map((mediumGoal) => {
                    const relatedSmallGoals = smallGoals.filter(
                      (sg) => sg.parent_goal_id === mediumGoal.id
                    )

                    return (
                      <div key={mediumGoal.id} className="border-l-4 border-purple-500 pl-4 ml-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-purple-500 text-white">中目標</Badge>
                          <Link
                            href={`/dashboard/goals/${mediumGoal.id}`}
                            className="font-semibold hover:underline"
                          >
                            {mediumGoal.title}
                          </Link>
                          <Badge variant="outline">
                            進捗 {mediumGoal.progress_percentage}%
                          </Badge>
                        </div>
                        {mediumGoal.description && (
                          <p className="text-sm text-muted-foreground ml-2 mb-2">
                            {mediumGoal.description}
                          </p>
                        )}
                        {mediumGoal.target_date && (
                          <p className="text-xs text-muted-foreground ml-2">
                            目標日: {format(new Date(mediumGoal.target_date), 'PPP', { locale: ja })}
                          </p>
                        )}

                        {/* 小目標（中目標に紐づく） */}
                        {relatedSmallGoals.length > 0 && (
                          <div className="mt-3 space-y-2 ml-4">
                            {relatedSmallGoals.map((smallGoal) => (
                              <div
                                key={smallGoal.id}
                                className="border-l-4 border-cyan-500 pl-4"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-cyan-500 text-white text-xs">
                                    小目標
                                  </Badge>
                                  <Link
                                    href={`/dashboard/goals/${smallGoal.id}`}
                                    className="text-sm hover:underline"
                                  >
                                    {smallGoal.title}
                                  </Link>
                                  <Badge variant="outline" className="text-xs">
                                    {smallGoal.progress_percentage}%
                                  </Badge>
                                </div>
                                {smallGoal.target_date && (
                                  <p className="text-xs text-muted-foreground ml-2 mt-1">
                                    目標日: {format(new Date(smallGoal.target_date), 'PPP', { locale: ja })}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* 独立した小目標（親がない） */}
              {smallGoals.filter((sg) => !sg.parent_goal_id).length > 0 && (
                <div className="space-y-2 ml-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    独立した小目標
                  </p>
                  {smallGoals
                    .filter((sg) => !sg.parent_goal_id)
                    .map((smallGoal) => (
                      <div
                        key={smallGoal.id}
                        className="border-l-4 border-cyan-500 pl-4"
                      >
                        <div className="flex items-center gap-2">
                          <Badge className="bg-cyan-500 text-white text-xs">
                            小目標
                          </Badge>
                          <Link
                            href={`/dashboard/goals/${smallGoal.id}`}
                            className="text-sm hover:underline"
                          >
                            {smallGoal.title}
                          </Link>
                          <Badge variant="outline" className="text-xs">
                            {smallGoal.progress_percentage}%
                          </Badge>
                        </div>
                        {smallGoal.target_date && (
                          <p className="text-xs text-muted-foreground ml-2 mt-1">
                            目標日: {format(new Date(smallGoal.target_date), 'PPP', { locale: ja })}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
