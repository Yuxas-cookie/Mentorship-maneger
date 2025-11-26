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
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Check, ChevronsUpDown, Star } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'

const visionFormSchema = z.object({
  student_id: z.string().min(1, '受講生を選択してください'),
  vision_title: z.string().min(1, 'ビジョンタイトルは必須です'),
  vision_description: z.string().optional(),
  vision_target_date: z.string().optional(),
})

type VisionFormValues = z.infer<typeof visionFormSchema>

interface VisionFormProps {
  students: Array<{
    id: string
    name: string
    real_name: string | null
    vision_title: string | null
    vision_description: string | null
    vision_target_date: string | null
  }>
}

export function VisionForm({ students }: VisionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  const form = useForm<VisionFormValues>({
    resolver: zodResolver(visionFormSchema),
    defaultValues: {
      student_id: '',
      vision_title: '',
      vision_description: '',
      vision_target_date: '',
    },
  })

  const selectedStudentId = form.watch('student_id')
  const selectedStudent = students.find((s) => s.id === selectedStudentId)

  // Update form when student is selected and they have existing vision
  const handleStudentSelect = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    form.setValue('student_id', studentId)

    if (student) {
      if (student.vision_title) {
        form.setValue('vision_title', student.vision_title)
      } else {
        form.setValue('vision_title', '')
      }

      if (student.vision_description) {
        form.setValue('vision_description', student.vision_description)
      } else {
        form.setValue('vision_description', '')
      }

      if (student.vision_target_date) {
        form.setValue('vision_target_date', student.vision_target_date)
      } else {
        form.setValue('vision_target_date', '')
      }
    }

    setOpen(false)
  }

  async function onSubmit(data: VisionFormValues) {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('students')
        .update({
          vision_title: data.vision_title,
          vision_description: data.vision_description || null,
          vision_target_date: data.vision_target_date || null,
        })
        .eq('id', data.student_id)

      if (error) throw error

      toast({
        title: '保存完了',
        description: 'ビジョンを保存しました',
      })

      router.push('/dashboard/goals')
      router.refresh()
    } catch (error) {
      console.error('Error saving vision:', error)
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
                            const student = students.find(
                              (student) => student.id === field.value
                            )
                            return student
                              ? student.real_name || student.name
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
                            onSelect={() => handleStudentSelect(student.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === student.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col flex-1">
                              <span className="font-medium">
                                {student.real_name || student.name}
                              </span>
                              {student.real_name && (
                                <span className="text-sm text-muted-foreground">
                                  @{student.name}
                                </span>
                              )}
                            </div>
                            {student.vision_title && (
                              <Badge variant="outline" className="ml-2 text-xs bg-blue-50 dark:bg-blue-950">
                                <Star className="h-3 w-3 mr-1" />
                                設定済み
                              </Badge>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                本名または氏名で検索できます
                {selectedStudent?.vision_title && (
                  <span className="block mt-1 text-blue-600 dark:text-blue-400">
                    ※ この受講生は既にビジョンが設定されています（更新されます）
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-300">
              将来のビジョン
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            講座を通して実現したいことや、将来なりたい姿を記入してください
          </p>

          <FormField
            control={form.control}
            name="vision_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ビジョンタイトル *</FormLabel>
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
                    rows={6}
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
            保存
          </Button>
        </div>
      </form>
    </Form>
  )
}
