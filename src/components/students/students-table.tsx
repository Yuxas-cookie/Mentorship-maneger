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

type Student = {
  id: string
  external_user_id: string | null
  real_name: string | null
  name: string
  email: string | null
  phone: string | null
  enrollment_date: string | null
  avatar_url: string | null
  goals_display: string | null
  status: 'active' | 'on_leave' | 'graduated' | 'withdrawn'
  course: { name: string } | null
  instructor: { name: string } | null
  notes: string | null
  created_at: string
  // Gamification fields
  level: number | null
  current_points: number | null
  total_points_earned: number | null
  current_rank: string | null
  rank_display_name: string | null
  rank_color: string | null
  current_exp: number | null
  max_exp: number | null
  total_exp: number | null
  badge_id: string | null
  badge_name: string | null
  badge_icon: string | null
  badge_color: string | null
  total_value_created: number | null
}

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

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: 'name',
    header: '本名・氏名',
    enableSorting: true,
    cell: ({ row }) => {
      const realName = row.original.real_name
      const username = row.getValue('name') as string
      return (
        <div className="min-w-[150px]">
          <div className="font-medium">{realName || username}</div>
          {realName && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              @{username}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'enrollment_date',
    header: '入会日',
    enableSorting: true,
    cell: ({ row }) => {
      const enrollmentDate = row.original.enrollment_date
      return enrollmentDate ? (
        <span className="min-w-[100px] inline-block">{format(new Date(enrollmentDate), 'yyyy/MM/dd')}</span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'level',
    header: 'レベル',
    enableSorting: true,
    cell: ({ row }) => {
      const level = row.original.level
      return level ? (
        <div className="flex items-center gap-1 min-w-[80px]">
          <span className="font-semibold text-blue-600 dark:text-blue-400">Lv.{level}</span>
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'total_value_created',
    header: '創出価値',
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.original.total_value_created
      return value !== null && value !== undefined && value > 0 ? (
        <span className="font-medium text-green-600 dark:text-green-400 min-w-[100px] inline-block">
          ¥{value.toLocaleString()}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'rank_display_name',
    header: 'ランク',
    enableSorting: true,
    cell: ({ row }) => {
      const rankName = row.original.rank_display_name
      const rankColor = row.original.rank_color
      return rankName ? (
        <Badge
          style={{ backgroundColor: rankColor || undefined }}
          className="text-white min-w-[80px]"
        >
          {rankName}
        </Badge>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'current_points',
    header: 'ポイント',
    enableSorting: true,
    cell: ({ row }) => {
      const points = row.original.current_points
      return points !== null && points !== undefined ? (
        <span className="font-medium min-w-[80px] inline-block">{points.toLocaleString()}</span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'ステータス',
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.getValue('status') as Student['status']
      return (
        <Badge className={statusColors[status]} variant="outline">
          {statusLabels[status]}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'external_user_id',
    header: 'ユーザーID',
    enableSorting: true,
    cell: ({ row }) => {
      const id = row.original.external_user_id
      return id ? (
        <span className="text-sm font-mono min-w-[120px] inline-block">{id}</span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'email',
    header: 'メール',
    enableSorting: true,
    cell: ({ row }) => {
      const email = row.original.email
      return email ? (
        <span className="text-sm min-w-[200px] inline-block">{email}</span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'phone',
    header: '電話番号',
    enableSorting: true,
    cell: ({ row }) => {
      const phone = row.original.phone
      return phone ? (
        <span className="text-sm min-w-[120px] inline-block">{phone}</span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'course',
    header: 'コース',
    enableSorting: false,
    cell: ({ row }) => {
      const course = row.original.course
      return course ? (
        <span className="min-w-[120px] inline-block">{course.name}</span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'instructor',
    header: '担当講師',
    enableSorting: false,
    cell: ({ row }) => {
      const instructor = row.original.instructor
      return instructor ? (
        <span className="min-w-[100px] inline-block">{instructor.name}</span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'total_points_earned',
    header: '総獲得ポイント',
    enableSorting: true,
    cell: ({ row }) => {
      const points = row.original.total_points_earned
      return points !== null && points !== undefined ? (
        <span className="min-w-[120px] inline-block">{points.toLocaleString()}</span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'current_exp',
    header: '現在の経験値',
    enableSorting: true,
    cell: ({ row }) => {
      const exp = row.original.current_exp
      const maxExp = row.original.max_exp
      return exp !== null ? (
        <span className="min-w-[100px] inline-block">
          {exp} / {maxExp || 100}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'total_exp',
    header: '総経験値',
    enableSorting: true,
    cell: ({ row }) => {
      const totalExp = row.original.total_exp
      return totalExp !== null ? (
        <span className="min-w-[100px] inline-block">{totalExp.toLocaleString()}</span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'badge_name',
    header: 'バッジ',
    enableSorting: true,
    cell: ({ row }) => {
      const badgeName = row.original.badge_name
      const badgeIcon = row.original.badge_icon
      const badgeColor = row.original.badge_color
      return badgeName ? (
        <div className="flex items-center gap-2 min-w-[120px]">
          {badgeIcon && <span>{badgeIcon}</span>}
          <Badge
            style={{ backgroundColor: badgeColor || undefined }}
            className="text-white"
          >
            {badgeName}
          </Badge>
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'goals_display',
    header: '目標',
    enableSorting: false,
    cell: ({ row }) => {
      const goals = row.original.goals_display
      return goals ? (
        <span className="text-sm min-w-[200px] inline-block truncate" title={goals}>
          {goals}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'notes',
    header: '備考',
    enableSorting: false,
    cell: ({ row }) => {
      const notes = row.original.notes
      return notes ? (
        <span className="text-sm min-w-[200px] inline-block truncate" title={notes}>
          {notes}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: '登録日時',
    enableSorting: true,
    cell: ({ row }) => {
      const createdAt = row.original.created_at
      return (
        <span className="text-sm min-w-[150px] inline-block">
          {format(new Date(createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const student = row.original

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
              <Link href={`/dashboard/students/${student.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                詳細を見る
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/students/${student.id}/edit`}>
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

interface StudentsTableProps {
  data: Student[]
}

export function StudentsTable({ data }: StudentsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="受講生名で検索..."
    />
  )
}
