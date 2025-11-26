import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all students with related data
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        course:courses(name),
        instructor:users!students_assigned_instructor_id_fkey(name)
      `)
      .order('name')

    if (error) throw error

    // Convert to CSV
    const headers = [
      'ID',
      '氏名',
      'メールアドレス',
      '電話番号',
      'ステータス',
      'コース',
      '担当講師',
      '備考',
      '登録日',
    ]

    const rows = students?.map((student: any) => [
      student.id,
      student.name,
      student.email,
      student.phone || '',
      student.status,
      student.course?.name || '',
      student.instructor?.name || '',
      (student.notes || '').replace(/\n/g, ' '),
      student.created_at,
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
        'Content-Disposition': `attachment; filename="students-${new Date().toISOString().split('T')[0]}.csv"`,
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
