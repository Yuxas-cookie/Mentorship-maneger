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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const courseFormSchema = z.object({
  name: z.string().min(1, 'コース名は必須です'),
  description: z.string().optional(),
})

type CourseFormValues = z.infer<typeof courseFormSchema>

interface CourseFormProps {
  initialData?: Partial<CourseFormValues>
  courseId?: string
}

export function CourseForm({ initialData, courseId }: CourseFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
    },
  })

  async function onSubmit(data: CourseFormValues) {
    setIsLoading(true)
    try {
      if (courseId) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          // @ts-ignore - Supabase types are complex
          .update({
            name: data.name,
            description: data.description || null,
          })
          .eq('id', courseId)

        if (error) throw error

        toast({
          title: '更新完了',
          description: 'コースを更新しました',
        })
      } else {
        // Create new course
        const { error } = await supabase
          .from('courses')
          // @ts-ignore - Supabase types are complex
          .insert({
            name: data.name,
            description: data.description || null,
          })

        if (error) throw error

        toast({
          title: '登録完了',
          description: '新しいコースを作成しました',
        })
      }

      router.push('/dashboard/courses')
      router.refresh()
    } catch (error) {
      console.error('Error saving course:', error)
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>コース名 *</FormLabel>
              <FormControl>
                <Input placeholder="例: Webアプリケーション開発" {...field} />
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
              <FormLabel>説明</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="コースの詳細説明を入力してください"
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
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
            {courseId ? '更新' : '登録'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
