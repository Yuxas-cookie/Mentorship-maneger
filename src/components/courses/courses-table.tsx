'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { Tables } from '@/types/database'

type Course = Tables<'courses'>

interface CoursesTableProps {
  courses: Course[]
}

export function CoursesTable({ courses }: CoursesTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const handleDelete = async () => {
    if (!selectedCourse) return

    const supabase = createClient()
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', selectedCourse.id)

    if (error) {
      toast({
        title: 'エラー',
        description: 'コースの削除に失敗しました',
        variant: 'destructive',
      })
    } else {
      toast({
        title: '削除完了',
        description: 'コースを削除しました',
      })
      setDeleteDialogOpen(false)
      router.refresh()
    }
  }

  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: 'name',
      header: 'コース名',
      cell: ({ row }) => {
        return (
          <div className="font-medium">{row.getValue('name')}</div>
        )
      },
    },
    {
      accessorKey: 'description',
      header: '説明',
      cell: ({ row }) => {
        const description = row.getValue('description') as string | null
        return (
          <div className="max-w-lg truncate text-muted-foreground">
            {description || '—'}
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const course = row.original

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">メニューを開く</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>アクション</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/courses/${course.id}/edit`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCourse(course)
                    setDeleteDialogOpen(true)
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={courses}
        searchKey="name"
        searchPlaceholder="コース名で検索..."
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{selectedCourse?.name}」を削除します。この操作は取り消せません。
              このコースに紐づく受講生のコース情報もクリアされます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
