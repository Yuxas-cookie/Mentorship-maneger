import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all interviews with related data
    const { data: interviews, error } = await supabase
      .from('interviews')
      .select(`
        *,
        student:students(name),
        interviewer:users!interviews_interviewer_id_fkey(name)
      `)
      .order('interview_date', { ascending: false })

    if (error) throw error

    // Convert to CSV
    const headers = [
      'ID',
      '面談日',
      '受講生',
      '担当講師',
      '面談種別',
      '概要',
      '面談内容',
      '次のアクション',
      '登録日',
    ]

    const rows = interviews?.map((interview: any) => [
      interview.id,
      interview.interview_date,
      interview.student?.name || '',
      interview.interviewer?.name || '',
      interview.interview_type,
      (interview.summary || '').replace(/\n/g, ' '),
      (interview.content || '').replace(/\n/g, ' '),
      (interview.next_action || '').replace(/\n/g, ' '),
      interview.created_at,
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
        'Content-Disposition': `attachment; filename="interviews-${new Date().toISOString().split('T')[0]}.csv"`,
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
