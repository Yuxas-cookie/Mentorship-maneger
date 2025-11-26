import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { parseStudentsFromCSV, ValidationError } from '@/lib/csv-parser'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // ユーザーが講師または管理者であることを確認
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'instructor' && userData.role !== 'admin')) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    // フォームデータからファイルを取得
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      )
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'CSVファイルのみアップロード可能です' },
        { status: 400 }
      )
    }

    // ファイルの内容を読み取る
    const fileContent = await file.text()

    // CSVをパースしてバリデーション
    const parseResult = parseStudentsFromCSV(fileContent)

    let successCount = 0
    let failedCount = 0
    const errors: ValidationError[] = []

    // 各受講生を登録
    for (const parsedStudent of parseResult.students) {
      // バリデーションエラーがある場合はスキップ
      if (parsedStudent.errors.length > 0) {
        failedCount++
        errors.push(...parsedStudent.errors)
        continue
      }

      try {
        // データベースに挿入
        const { error: insertError } = await supabase
          .from('students')
          .insert({
            // Basic Information
            external_user_id: parsedStudent.data.external_user_id || null,
            real_name: parsedStudent.data.real_name || null,
            name: parsedStudent.data.name!,
            email: parsedStudent.data.email || null,
            phone: parsedStudent.data.phone || null,
            enrollment_date: parsedStudent.data.enrollment_date || null,

            // Profile
            avatar_url: parsedStudent.data.avatar_url || null,

            // Goals
            goals_display: parsedStudent.data.goals_display || null,

            // Course & Instructor
            course_id: parsedStudent.data.course_id || null,
            assigned_instructor_id: parsedStudent.data.assigned_instructor_id || null,

            // Status
            status: parsedStudent.data.status || 'active',

            // Notes
            notes: parsedStudent.data.notes || null,

            // Points System
            current_points: parsedStudent.data.current_points || 0,
            total_points_earned: parsedStudent.data.total_points_earned || 0,

            // Rank System
            current_rank: parsedStudent.data.current_rank || null,
            rank_display_name: parsedStudent.data.rank_display_name || null,
            rank_color: parsedStudent.data.rank_color || null,
            rank_updated_at: parsedStudent.data.rank_updated_at || null,

            // Level System
            level: parsedStudent.data.level || 1,
            current_exp: parsedStudent.data.current_exp || 0,
            max_exp: parsedStudent.data.max_exp || 100,
            total_exp: parsedStudent.data.total_exp || 0,
            level_updated_at: parsedStudent.data.level_updated_at || null,

            // Badge System
            badge_id: parsedStudent.data.badge_id || null,
            badge_name: parsedStudent.data.badge_name || null,
            badge_icon: parsedStudent.data.badge_icon || null,
            badge_color: parsedStudent.data.badge_color || null,
            badge_level_up_at: parsedStudent.data.badge_level_up_at || null,

            // Value Created
            total_value_created: parsedStudent.data.total_value_created || 0,
          })

        if (insertError) {
          failedCount++
          errors.push({
            row: parsedStudent.row,
            field: 'データベース',
            message: insertError.message
          })
        } else {
          successCount++
        }
      } catch (error) {
        failedCount++
        errors.push({
          row: parsedStudent.row,
          field: 'データベース',
          message: error instanceof Error ? error.message : '不明なエラー'
        })
      }
    }

    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      errors: errors
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      {
        error: 'インポート処理中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    )
  }
}
