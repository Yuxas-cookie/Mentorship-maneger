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
import { cn } from '@/lib/utils'

const interviewFormSchema = z.object({
  student_id: z.string().min(1, '受講生を選択してください'),
  interview_date: z.string().min(1, '面談日を入力してください'),
  interview_type: z.enum(['regular', 'emergency', 'career', 'other']),
  summary: z.string().min(1, '概要は必須です'),
  content: z.string().min(1, '面談内容は必須です'),
  next_action: z.string().optional(),
})

type InterviewFormValues = z.infer<typeof interviewFormSchema>

interface InterviewFormProps {
  students: Array<{ id: string; name: string; real_name: string | null }>
  interviewerId: string
  initialData?: Partial<InterviewFormValues>
  interviewId?: string
}

export function InterviewForm({ students, interviewerId, initialData, interviewId }: InterviewFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: initialData || {
      student_id: '',
      interview_date: new Date().toISOString().split('T')[0],
      interview_type: 'regular',
      summary: '',
      content: '',
      next_action: '',
    },
  })

  async function onSubmit(data: InterviewFormValues) {
    setIsLoading(true)
    try {
      const payload = {
        ...data,
        interviewer_id: interviewerId,
      }

      if (interviewId) {
        // Update existing interview
        const { error } = await supabase
          .from('interviews')
          // @ts-ignore - Supabase types are complex
          .update(payload)
          .eq('id', interviewId)

        if (error) throw error

        toast({
          title: '更新完了',
          description: '面談記録を更新しました',
        })
      } else {
        // Create new interview
        const { error } = await supabase
          .from('interviews')
          // @ts-ignore - Supabase types are complex
          .insert(payload)

        if (error) throw error

        toast({
          title: '登録完了',
          description: '新しい面談記録を作成しました',
        })
      }

      router.push('/dashboard/interviews')
      router.refresh()
    } catch (error) {
      console.error('Error saving interview:', error)
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="interview_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>面談日 *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interview_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>面談種別 *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="種別を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="regular">定期面談</SelectItem>
                    <SelectItem value="emergency">緊急面談</SelectItem>
                    <SelectItem value="career">キャリア相談</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>概要 *</FormLabel>
              <FormControl>
                <Input placeholder="面談の概要を入力" {...field} />
              </FormControl>
              <FormDescription>
                面談の要点を簡潔に記入してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>面談内容 *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="面談の詳細内容を入力&#10;&#10;- 学習進捗&#10;- 困っている点&#10;- モチベーション&#10;- その他"
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                面談で話した内容を詳しく記録してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="next_action"
          render={({ field }) => (
            <FormItem>
              <FormLabel>次のアクション</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="次回までに行うこと、フォローアップ事項など"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                今後の対応や宿題などを記入してください
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
            {interviewId ? '更新' : '登録'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
