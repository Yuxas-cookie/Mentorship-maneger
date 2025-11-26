'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const studentFormSchema = z.object({
  real_name: z.string().optional(),
  name: z.string().min(1, 'ユーザー名は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().optional(),
  enrollment_date: z.string().optional(),
  goals_display: z.string().optional(),
  vision_title: z.string().optional(),
  vision_description: z.string().optional(),
  vision_target_date: z.string().optional(),
  course_id: z.string().optional(),
  assigned_instructor_id: z.string().optional(),
  status: z.enum(['active', 'on_leave', 'graduated', 'withdrawn']),
  notes: z.string().optional(),
})

type StudentFormValues = z.infer<typeof studentFormSchema>

interface StudentFormProps {
  courses: Array<{ id: string; name: string }>
  instructors: Array<{ id: string; name: string }>
  initialData?: Partial<StudentFormValues>
  studentId?: string
}

export function StudentForm({ courses, instructors, initialData, studentId }: StudentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: initialData || {
      real_name: '',
      name: '',
      email: '',
      phone: '',
      enrollment_date: '',
      goals_display: '',
      vision_title: '',
      vision_description: '',
      vision_target_date: '',
      course_id: '',
      assigned_instructor_id: '',
      status: 'active',
      notes: '',
    },
  })

  async function onSubmit(data: StudentFormValues) {
    setIsLoading(true)
    try {
      if (studentId) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          // @ts-ignore - Supabase types are complex
          .update({
            ...data,
            course_id: data.course_id || null,
            assigned_instructor_id: data.assigned_instructor_id || null,
          })
          .eq('id', studentId)

        if (error) throw error

        toast({
          title: '更新完了',
          description: '受講生情報を更新しました',
        })
      } else {
        // Create new student
        const { error } = await supabase
          .from('students')
          // @ts-ignore - Supabase types are complex
          .insert({
            ...data,
            course_id: data.course_id || null,
            assigned_instructor_id: data.assigned_instructor_id || null,
          })

        if (error) throw error

        toast({
          title: '登録完了',
          description: '新しい受講生を登録しました',
        })
      }

      router.push('/dashboard/students')
      router.refresh()
    } catch (error) {
      console.error('Error saving student:', error)
      toast({
        title: 'エラー',
        description: '保存に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="real_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>本名</FormLabel>
              <FormControl>
                <Input placeholder="山田 太郎" {...field} />
              </FormControl>
              <FormDescription>
                受講生の実名（任意）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ユーザー名 *</FormLabel>
              <FormControl>
                <Input placeholder="yamada_taro" {...field} />
              </FormControl>
              <FormDescription>
                表示名として使用されます
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="example@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>電話番号</FormLabel>
              <FormControl>
                <Input placeholder="090-1234-5678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enrollment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>入会日</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ステータス *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="ステータスを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">在籍中</SelectItem>
                    <SelectItem value="on_leave">休学中</SelectItem>
                    <SelectItem value="graduated">卒業</SelectItem>
                    <SelectItem value="withdrawn">退会</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="goals_display"
          render={({ field }) => (
            <FormItem>
              <FormLabel>目標表示</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="受講生の目標や現在の進捗を入力してください"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                受講生が目指している目標や、現在取り組んでいる課題などを記入できます
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-semibold text-lg">将来のビジョン</h3>
          <p className="text-sm text-muted-foreground">
            講座を通して実現したいことや、将来なりたい姿を記入してください
          </p>

          <FormField
            control={form.control}
            name="vision_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ビジョンタイトル</FormLabel>
                <FormControl>
                  <Input
                    placeholder="例: フリーランスWebエンジニアとして独立する"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vision_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ビジョンの詳細</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="具体的にどんなことをやりたいか、どんな人になりたいかを詳しく記入してください"
                    className="resize-none"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  将来の夢や目指す姿を具体的に記入できます
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vision_target_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ビジョン達成目標時期</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>
                  いつ頃までに実現したいかの目安を設定できます
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="course_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>コース</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="コースを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigned_instructor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>担当講師</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="講師を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {instructors.map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>備考</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="特記事項があれば入力してください"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                受講生に関する補足情報を記入できます
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {studentId ? '更新' : '登録'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
