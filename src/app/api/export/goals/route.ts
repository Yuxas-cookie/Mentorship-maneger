import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all goals with related data
    const { data: goals, error } = await supabase
      .from('goals')
      .select(`
        *,
        student:students(name)
      `)
      .order('target_date', { ascending: false })

    if (error) throw error

    // Convert to CSV
    const headers = [
      'ID',
      '受講生',
      '目標タイトル',
      '詳細説明',
      '目標日',
      'ステータス',
      '進捗率',
      '登録日',
      '更新日',
    ]

    const rows = goals?.map((goal: any) => [
      goal.id,
      goal.student?.name || '',
      goal.title,
      (goal.description || '').replace(/\n/g, ' '),
      goal.target_date,
      goal.status,
      goal.progress_percentage,
      goal.created_at,
      goal.updated_at,
    ]) || []

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="goals-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'エクスポートに失敗しました' },
      { status: 500 }
    )
  }
}
