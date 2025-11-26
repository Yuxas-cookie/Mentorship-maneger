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

type Interview = {
  id: string
  student_id: string
  interviewer_id: string
  interview_date: string
  interview_type: 'regular' | 'emergency' | 'career' | 'other'
  summary: string
  student: { name: string } | null
  interviewer: { name: string } | null
  created_at: string
}

const interviewTypeLabels = {
  regular: '定期面談',
  emergency: '緊急面談',
  career: 'キャリア相談',
  other: 'その他',
}

const interviewTypeColors = {
  regular: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  emergency: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  career: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
}

export const columns: ColumnDef<Interview>[] = [
  {
    accessorKey: 'interview_date',
    header: '面談日',
    cell: ({ row }) => {
      return format(new Date(row.getValue('interview_date')), 'PPP', { locale: ja })
    },
  },
  {
    accessorKey: 'student',
    header: '受講生',
    cell: ({ row }) => {
      const student = row.original.student
      return <div className="font-medium">{student?.name || '不明'}</div>
    },
  },
  {
    accessorKey: 'interviewer',
    header: '面談者',
    cell: ({ row }) => {
      const interviewer = row.original.interviewer
      return <div>{interviewer?.name || '不明'}</div>
    },
  },
  {
    accessorKey: 'interview_type',
    header: '種別',
    cell: ({ row }) => {
      const type = row.getValue('interview_type') as Interview['interview_type']
      return (
        <Badge className={interviewTypeColors[type]} variant="outline">
          {interviewTypeLabels[type]}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'summary',
    header: '概要',
    cell: ({ row }) => {
      const summary = row.getValue('summary') as string
      return (
        <div className="max-w-md truncate" title={summary}>
          {summary}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const interview = row.original

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
              <Link href={`/dashboard/interviews/${interview.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                詳細を見る
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/interviews/${interview.id}/edit`}>
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

interface InterviewsTableProps {
  data: Interview[]
}

export function InterviewsTable({ data }: InterviewsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="summary"
      searchPlaceholder="面談記録を検索..."
    />
  )
}
