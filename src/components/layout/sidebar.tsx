'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  Target,
  FileText,
  Settings,
  Tag,
} from 'lucide-react'

interface SidebarProps {
  userRole: 'admin' | 'instructor'
}

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard, adminOnly: false },
  { name: '受講生管理', href: '/dashboard/students', icon: Users, adminOnly: false },
  { name: '面談記録', href: '/dashboard/interviews', icon: MessageSquare, adminOnly: false },
  { name: '目標管理', href: '/dashboard/goals', icon: Target, adminOnly: false },
  { name: 'レポート', href: '/dashboard/reports', icon: FileText, adminOnly: false },
  { name: 'コース管理', href: '/dashboard/courses', icon: BookOpen, adminOnly: true },
  { name: 'タグ管理', href: '/dashboard/tags', icon: Tag, adminOnly: true },
  { name: '設定', href: '/dashboard/settings', icon: Settings, adminOnly: true },
]

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || userRole === 'admin'
  )

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-r border-gray-200/50 dark:border-gray-700/50 overflow-y-auto shadow-xl">
          <div className="flex items-center flex-shrink-0 px-4 h-16 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Mentorship
              </h1>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/50 hover:shadow-sm'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200',
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:scale-110'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
