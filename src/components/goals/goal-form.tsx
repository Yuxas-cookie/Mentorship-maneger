'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TablesInsert, TablesUpdate } from '@/types/database'

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
import { Loader2, Check, ChevronsUpDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const goalFormSchema = z.object({
  student_id: z.string().min(1, '受講生を選択してください'),
  goal_type: z.enum(['medium', 'small']),
  parent_goal_id: z.string().optional(),
  title: z.string().min(1, '目標タイトルは必須です'),
  description: z.string().optional(),
  target_date: z.string().min(1, '目標日を入力してください'),
  status: z.enum(['not_started', 'in_progress', 'completed', 'cancelled']),
  progress_percentage: z.number().min(0).max(100),
})

type GoalFormValues = z.infer<typeof goalFormSchema>

interface GoalFormProps {
  students: Array<{ id: string; name: string; real_name: string | null }>
  mediumGoals?: Array<{ id: string; title: string; student_id: string }>
  initialData?: Partial<GoalFormValues>
  goalId?: string
}

export function GoalForm({ students, mediumGoals = [], initialData, goalId }: GoalFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  const defaultValues = useMemo(() => ({
    student_id: initialData?.student_id || '',
    goal_type: initialData?.goal_type || 'small',
    parent_goal_id: initialData?.parent_goal_id || undefined,
    title: initialData?.title || '',
    description: initialData?.description || '',
    target_date: initialData?.target_date || '',
    status: initialData?.status || 'not_started',
    progress_percentage: initialData?.progress_percentage ?? 0,
  }), [initialData])

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues,
  })

  const selectedStudentId = form.watch('student_id')
  const goalType = form.watch('goal_type')

  // Check if goal type is preset (from URL params)
  const isGoalTypePreset = !!initialData?.goal_type

  // Filter medium goals for the selected student
  const availableMediumGoals = mediumGoals.filter(
    (goal) => goal.student_id === selectedStudentId
  )

  async function onSubmit(data: GoalFormValues) {
    setIsLoading(true)
    try {
      const payload = {
        student_id: data.student_id,
        goal_type: data.goal_type,
        parent_goal_id: data.goal_type === 'small' && data.parent_goal_id ? data.parent_goal_id : null,
        title: data.title,
        description: data.description || null,
        target_date: data.target_date,
        status: data.status,
        progress_percentage: data.progress_percentage,
      }

      if (goalId) {
        // Update existing goal
        const { error } = await supabase
          .from('goals')
          // @ts-ignore - Supabase types are complex
          .update(payload)
          .eq('id', goalId)

        if (error) throw error

        const goalTypeLabel = data.goal_type === 'medium' ? '中目標' : '小目標'
        toast({
          title: '更新完了',
          description: `${goalTypeLabel}を更新しました`,
        })
      } else {
        // Create new goal
        const { error } = await supabase
          .from('goals')
          // @ts-ignore - Supabase types are complex
          .insert(payload)

        if (error) throw error

        const goalTypeLabel = data.goal_type === 'medium' ? '中目標' : '小目標'
        toast({
          title: '登録完了',
          description: `新しい${goalTypeLabel}を作成しました`,
        })
      }

      router.push('/dashboard/goals')
      router.refresh()
    } catch (error) {
      console.error('Error saving goal:', error)
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
          name="student_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>受講生 *</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? (() => {
                            const selectedStudent = students.find(
                              (student) => student.id === field.value
                            )
                            return selectedStudent
                              ? selectedStudent.real_name || selectedStudent.name
                              : "受講生を選択"
                          })()
                        : "受講生を選択"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="本名または氏名で検索..." />
                    <CommandList>
                      <CommandEmpty>受講生が見つかりません</CommandEmpty>
                      <CommandGroup>
                        {students.map((student) => (
                          <CommandItem
                            key={student.id}
                            value={`${student.real_name || ''} ${student.name}`}
                            onSelect={() => {
                              form.setValue("student_id", student.id)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === student.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {student.real_name || student.name}
                              </span>
                              {student.real_name && (
                                <span className="text-sm text-muted-foreground">
                                  @{student.name}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                本名または氏名で検索できます
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {isGoalTypePreset ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">目標タイプ</label>
            <div>
              <Badge
                className={
                  goalType === 'medium'
                    ? 'bg-purple-500 text-white text-base px-4 py-2'
                    : 'bg-cyan-500 text-white text-base px-4 py-2'
                }
              >
                {goalType === 'medium' ? '中目標（マイルストーン）' : '小目標（具体的なタスク）'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {goalType === 'medium'
                ? '大きな段階や節目となる目標です'
                : '具体的なタスクとして詳細な進捗管理を行います'}
            </p>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="goal_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>目標タイプ *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="目標タイプを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="medium">中目標（マイルストーン）</SelectItem>
                    <SelectItem value="small">小目標（具体的なタスク）</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  中目標は大きな段階、小目標は詳細な進捗管理に使用します
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {goalType === 'small' && availableMediumGoals.length > 0 && (
          <FormField
            control={form.control}
            name="parent_goal_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>所属する中目標</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                  defaultValue={field.value || 'none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="中目標を選択（任意）" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">なし</SelectItem>
                    {availableMediumGoals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  この小目標が所属する中目標を選択できます
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>目標タイトル *</FormLabel>
              <FormControl>
                <Input placeholder="例: Webアプリケーション開発の基礎習得" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>詳細説明</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="目標の詳細内容や達成基準を記入してください"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                具体的な達成基準やマイルストーンを記載できます
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="target_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>目標達成日 *</FormLabel>
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
                    <SelectItem value="not_started">未着手</SelectItem>
                    <SelectItem value="in_progress">進行中</SelectItem>
                    <SelectItem value="completed">完了</SelectItem>
                    <SelectItem value="cancelled">中止</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="progress_percentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>進捗率 (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                0から100の間で入力してください
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
            {goalId ? '更新' : '登録'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
