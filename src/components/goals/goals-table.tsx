'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Eye, Edit, Trash } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Progress } from '@/components/ui/progress'

type Goal = {
  id: string
  student_id: string
  goal_type: string | null
  parent_goal_id: string | null
  title: string
  description: string | null
  target_date: string
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled'
  progress_percentage: number
  student: { name: string; real_name: string | null } | null
  parent_goal: { title: string } | null
  created_at: string
}

const goalTypeLabels = {
  medium: '中目標',
  small: '小目標',
}

const goalTypeColors = {
  medium: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  small: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
}

const statusLabels = {
  not_started: '未着手',
  in_progress: '進行中',
  completed: '完了',
  cancelled: '中止',
}

const statusColors = {
  not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export const columns: ColumnDef<Goal>[] = [
  {
    accessorKey: 'student',
    header: '受講生',
    cell: ({ row }) => {
      const student = row.original.student
      if (!student) return <div className="text-gray-400">不明</div>
      return (
        <div>
          <div className="font-medium">{student.real_name || student.name}</div>
          {student.real_name && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              @{student.name}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'goal_type',
    header: 'タイプ',
    cell: ({ row }) => {
      const goalType = row.original.goal_type as 'medium' | 'small' | null
      if (!goalType) return <span className="text-gray-400">-</span>
      return (
        <Badge className={goalTypeColors[goalType]} variant="outline">
          {goalTypeLabels[goalType]}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'title',
    header: '目標',
    cell: ({ row }) => {
      const parentGoal = row.original.parent_goal
      const isSmallGoal = row.original.goal_type === 'small' && parentGoal

      return (
        <div className="max-w-md">
          {isSmallGoal && (
            <div className="text-xs text-muted-foreground mb-1">
              ↳ {parentGoal.title}
            </div>
          )}
          <div className={`font-medium ${isSmallGoal ? 'ml-4' : ''}`}>
            {row.getValue('title')}
          </div>
          {row.original.description && (
            <div className={`text-sm text-muted-foreground truncate ${isSmallGoal ? 'ml-4' : ''}`}>
              {row.original.description}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'target_date',
    header: '目標日',
    cell: ({ row }) => {
      return format(new Date(row.getValue('target_date')), 'PPP', { locale: ja })
    },
  },
  {
    accessorKey: 'progress_percentage',
    header: '進捗',
    cell: ({ row }) => {
      const progress = row.getValue('progress_percentage') as number
      return (
        <div className="flex items-center space-x-2">
          <Progress value={progress} className="w-20" />
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'ステータス',
    cell: ({ row }) => {
      const status = row.getValue('status') as Goal['status']
      return (
        <Badge className={statusColors[status]} variant="outline">
          {statusLabels[status]}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const goal = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">メニューを開く</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/goals/${goal.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                詳細を見る
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/goals/${goal.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                編集
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface GoalsTableProps {
  data: Goal[]
}

export function GoalsTable({ data }: GoalsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="title"
      searchPlaceholder="目標を検索..."
    />
  )
}
