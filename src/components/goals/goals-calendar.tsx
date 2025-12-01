'use client'

import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer, Event, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, List, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

const locales = {
  ja: ja,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface GoalEvent extends Event {
  id: string
  title: string
  start: Date
  end: Date
  studentName: string
  studentRealName?: string
  goalType: 'medium' | 'small'
  status: string
  progressPercentage: number
  description?: string
  fullTitle: string
}

interface GoalsCalendarProps {
  goals: Array<{
    id: string
    title: string
    description?: string | null
    target_date: string
    goal_type: 'medium' | 'small'
    status: string
    progress_percentage: number
    student: {
      name: string
      real_name: string | null
    } | null
  }>
}

const statusLabels = {
  not_started: '未着手',
  in_progress: '進行中',
  completed: '完了',
  cancelled: '中止',
}

const goalTypeLabels = {
  medium: '中目標',
  small: '小目標',
}

export function GoalsCalendar({ goals }: GoalsCalendarProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [isMobile, setIsMobile] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<GoalEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDayEvents, setSelectedDayEvents] = useState<GoalEvent[]>([])

  // Define events array first
  const events: GoalEvent[] = goals
    .filter(goal => goal.target_date)
    .map(goal => {
      const targetDate = new Date(goal.target_date)
      const studentDisplayName = goal.student?.real_name || goal.student?.name || '不明'
      return {
        id: goal.id,
        title: `${studentDisplayName}: ${goal.title}`,
        fullTitle: goal.title,
        start: targetDate,
        end: targetDate,
        studentName: goal.student?.name || '',
        studentRealName: goal.student?.real_name || undefined,
        goalType: goal.goal_type,
        status: goal.status,
        progressPercentage: goal.progress_percentage,
        description: goal.description || undefined,
      }
    })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setViewMode('list')
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Set today's date and events on initial load
  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day

    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.start)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate.getTime() === today.getTime()
    })

    setSelectedDate(today)
    setSelectedDayEvents(todayEvents)
  }, [events])

  // Sort events by date for list view
  const sortedGoals = [...goals]
    .filter(goal => goal.target_date)
    .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())

  const eventStyleGetter = (event: GoalEvent) => {
    let backgroundColor = '#3b82f6' // default blue

    if (event.goalType === 'medium') {
      backgroundColor = '#a855f7' // purple for medium goals
    } else if (event.goalType === 'small') {
      backgroundColor = '#06b6d4' // cyan for small goals
    }

    // Darker color if completed
    if (event.status === 'completed') {
      backgroundColor = '#22c55e' // green for completed
    } else if (event.status === 'cancelled') {
      backgroundColor = '#ef4444' // red for cancelled
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    }
  }

  const EventComponent = ({ event }: { event: GoalEvent }) => (
    <div className="text-xs">
      <div className="font-semibold truncate">{event.studentRealName || event.studentName}</div>
      <div className="truncate">{event.title.split(': ')[1]}</div>
      <div className="text-[10px]">{event.progressPercentage}%</div>
    </div>
  )

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    // Filter events for the selected date
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start)
      return (
        eventDate.getFullYear() === start.getFullYear() &&
        eventDate.getMonth() === start.getMonth() &&
        eventDate.getDate() === start.getDate()
      )
    })

    if (dayEvents.length > 0) {
      setSelectedDate(start)
      setSelectedDayEvents(dayEvents)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Legend and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-purple-500 text-white text-xs md:text-sm">🟣 中目標</Badge>
          <Badge className="bg-cyan-500 text-white text-xs md:text-sm">🔵 小目標</Badge>
          <Badge className="bg-green-500 text-white text-xs md:text-sm">✅ 完了</Badge>
          <Badge className="bg-red-500 text-white text-xs md:text-sm">❌ 中止</Badge>
        </div>

        {!isMobile && (
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              カレンダー
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" />
              リスト
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-2xl">目標カレンダー</CardTitle>
          <CardDescription className="text-sm">
            全受講生の目標期限を表示しています（{events.length}件）
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          {viewMode === 'calendar' ? (
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Calendar */}
              <div className="flex-1 h-[500px] md:h-[700px]">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  eventPropGetter={eventStyleGetter}
                  onSelectEvent={(event) => setSelectedEvent(event as GoalEvent)}
                  onSelectSlot={handleSelectSlot}
                  selectable
                  components={{
                    event: EventComponent,
                  }}
                  messages={{
                    next: '次へ',
                    previous: '前へ',
                    today: '今日',
                    month: '月',
                    week: '週',
                    day: '日',
                    agenda: '予定',
                    date: '日付',
                    time: '時間',
                    event: 'イベント',
                    noEventsInRange: 'この期間にはイベントがありません',
                    showMore: (total) => `+ ${total} 件`,
                  }}
                  culture="ja"
                  views={['month', 'agenda']}
                  defaultView="month"
                />
              </div>

              {/* Selected Day Events Sidebar */}
              {selectedDate && selectedDayEvents.length > 0 && (
                <div className="lg:w-80 xl:w-96">
                  <div className="sticky top-4">
                    <Card className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-semibold">
                            {format(selectedDate, 'M月d日（E）', { locale: ja })}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDate(null)}
                            className="h-6 w-6 p-0"
                          >
                            ✕
                          </Button>
                        </div>
                        <CardDescription className="text-xs">
                          {selectedDayEvents.length}件の目標
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                        {selectedDayEvents.map((event) => {
                          const goalTypeColor = event.goalType === 'medium'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                            : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'

                          const statusColor =
                            event.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : event.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : event.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'

                          return (
                            <div
                              key={event.id}
                              className="p-3 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-800 hover:border-primary"
                              onClick={() => setSelectedEvent(event)}
                            >
                              <div className="space-y-2">
                                {/* Badges */}
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="outline" className={`${goalTypeColor} text-[10px] px-1.5 py-0`}>
                                    {goalTypeLabels[event.goalType]}
                                  </Badge>
                                  <Badge variant="outline" className={`${statusColor} text-[10px] px-1.5 py-0`}>
                                    {statusLabels[event.status as keyof typeof statusLabels]}
                                  </Badge>
                                </div>

                                {/* Student and Title */}
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {event.studentRealName || event.studentName}
                                  </div>
                                  <h3 className="font-semibold text-sm line-clamp-2">{event.fullTitle}</h3>
                                </div>

                                {/* Progress */}
                                <div className="flex items-center gap-2">
                                  <Progress value={event.progressPercentage} className="flex-1 h-1.5" />
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {event.progressPercentage}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] md:max-h-[700px] overflow-y-auto">
              {sortedGoals.map((goal) => {
                const goalTypeColor = goal.goal_type === 'medium' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
                const statusColor =
                  goal.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  goal.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                  goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'

                return (
                  <Link
                    key={goal.id}
                    href={`/dashboard/goals/${goal.id}`}
                    className="block p-3 md:p-4 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={`${goalTypeColor} text-xs`}>
                            {goalTypeLabels[goal.goal_type as 'medium' | 'small']}
                          </Badge>
                          <Badge variant="outline" className={`${statusColor} text-xs`}>
                            {statusLabels[goal.status as keyof typeof statusLabels]}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm md:text-base">{goal.title}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground mt-1">
                            {goal.student?.real_name || goal.student?.name || '不明'}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <span>期限: {format(new Date(goal.target_date), 'PPP', { locale: ja })}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>進捗: {goal.progress_percentage}%</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {sortedGoals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  期限が設定された目標がありません
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedEvent?.fullTitle}
            </DialogTitle>
            <DialogDescription>
              目標の詳細情報
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              {/* Student Info */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">受講生</h3>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-medium">
                    {selectedEvent.studentRealName || selectedEvent.studentName}
                  </div>
                  {selectedEvent.studentRealName && (
                    <div className="text-sm text-muted-foreground">
                      @{selectedEvent.studentName}
                    </div>
                  )}
                </div>
              </div>

              {/* Goal Type and Status */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">目標タイプ</h3>
                  <Badge
                    className={
                      selectedEvent.goalType === 'medium'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                        : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
                    }
                    variant="outline"
                  >
                    {goalTypeLabels[selectedEvent.goalType]}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">ステータス</h3>
                  <Badge
                    className={
                      selectedEvent.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : selectedEvent.status === 'cancelled'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        : selectedEvent.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }
                    variant="outline"
                  >
                    {statusLabels[selectedEvent.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
              </div>

              {/* Target Date */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">目標期限</h3>
                <div className="text-lg">
                  {format(selectedEvent.start, 'PPP', { locale: ja })}
                </div>
              </div>

              {/* Progress */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">進捗状況</h3>
                <div className="flex items-center gap-4">
                  <Progress value={selectedEvent.progressPercentage} className="flex-1" />
                  <span className="text-lg font-semibold">{selectedEvent.progressPercentage}%</span>
                </div>
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">説明</h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedEvent.description}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Link href={`/dashboard/goals/${selectedEvent.id}`} className="flex-1">
                  <Button className="w-full" variant="default">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    詳細ページを見る
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setSelectedEvent(null)}
                >
                  閉じる
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
