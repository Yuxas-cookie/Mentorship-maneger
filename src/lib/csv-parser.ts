import { TablesInsert } from '@/types/database'

export interface ValidationError {
  row: number
  field: string
  message: string
}

export interface ParsedStudent {
  data: Partial<TablesInsert<'students'>>
  errors: ValidationError[]
  row: number
}

export interface CSVParseResult {
  students: ParsedStudent[]
  totalErrors: number
}

// フィールドマッピング定義
interface FieldMapping {
  [key: string]: string[]
}

// 各フィールドに対応する可能性のある列名（複数の表記に対応）
const FIELD_MAPPINGS: FieldMapping = {
  // Basic Information
  external_user_id: ['ユーザーID', 'id', 'user_id', 'external_user_id'],
  name: ['氏名', 'name', '名前', '受講生名', 'ユーザー名'],
  real_name: ['本名', 'real_name', '実名'],
  email: ['メールアドレス', 'email', 'Eメール', 'メール'],
  phone: ['電話番号', 'phone', '電話', '連絡先'],
  enrollment_date: ['入会日', 'enrollment_date', '登録日時', 'created_at', '入会年月日'],

  // Profile
  avatar_url: ['アバターURL', 'avatar_url', 'avatar', 'プロフィール画像'],

  // Goals
  goals_display: ['目標表示', 'goals_display', '目標', 'ゴール'],

  // Course & Instructor
  course_id: ['コースID', 'course_id'],
  assigned_instructor_id: ['担当講師ID', 'assigned_instructor_id', '講師ID'],

  // Status
  status: ['ステータス', 'status', '状態', 'ロール', 'role'],

  // Notes
  notes: ['備考', 'notes', 'メモ', '特記事項'],

  // Points System (Article Platform)
  current_points: ['現在のポイント', 'current_points'],
  total_points_earned: ['総獲得ポイント', 'total_points_earned'],

  // Rank System (Article Platform)
  current_rank: ['現在のランク', 'current_rank'],
  rank_display_name: ['ランク表示名', 'rank_display_name'],
  rank_color: ['ランク色', 'rank_color'],
  rank_updated_at: ['ランク更新日時', 'rank_updated_at'],

  // Level System (Article Platform)
  level: ['レベル', 'level'],
  current_exp: ['現在の経験値', 'current_exp'],
  max_exp: ['必要経験値', 'max_exp'],
  total_exp: ['総経験値', 'total_exp'],
  level_updated_at: ['レベル更新日時', 'level_updated_at'],

  // Badge System (Article Platform)
  badge_id: ['バッジID', 'badge_id'],
  badge_name: ['バッジ名', 'badge_name'],
  badge_icon: ['バッジアイコン', 'badge_icon'],
  badge_color: ['バッジ色', 'badge_color'],
  badge_level_up_at: ['バッジ取得日時', 'badge_level_up_at'],

  // Value Created (Article Platform)
  total_value_created: ['創出価値', 'total_value_created']
}

// CSV文字列をパースする関数（RFC 4180準拠）
export function parseCSV(csvText: string): string[][] {
  // BOM（Byte Order Mark）を除去
  const cleanedText = csvText.replace(/^\uFEFF/, '')

  const lines: string[][] = []
  let currentLine: string[] = []
  let currentField = ''
  let insideQuotes = false

  for (let i = 0; i < cleanedText.length; i++) {
    const char = cleanedText[i]
    const nextChar = cleanedText[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // エスケープされたダブルクォート
        currentField += '"'
        i++ // 次の文字をスキップ
      } else {
        // クォートの開始/終了
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      // フィールドの区切り
      currentLine.push(currentField.trim())
      currentField = ''
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      // 行の終わり
      if (currentField || currentLine.length > 0) {
        currentLine.push(currentField.trim())
        if (currentLine.some(field => field.length > 0)) {
          lines.push(currentLine)
        }
        currentLine = []
        currentField = ''
      }
      // \r\nの場合は\nをスキップ
      if (char === '\r' && nextChar === '\n') {
        i++
      }
    } else {
      currentField += char
    }
  }

  // 最後のフィールドと行を追加
  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField.trim())
    if (currentLine.some(field => field.length > 0)) {
      lines.push(currentLine)
    }
  }

  // 空行とコメント行を除外
  return lines.filter(line => {
    const firstField = line[0]?.trim()
    return firstField && !firstField.startsWith('#')
  })
}

// ヘッダー行から列インデックスのマッピングを作成
function createColumnMapping(headers: string[]): Map<string, number> {
  const mapping = new Map<string, number>()

  for (const [fieldKey, possibleNames] of Object.entries(FIELD_MAPPINGS)) {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].trim()
      if (possibleNames.some(name => header === name || header.includes(name))) {
        mapping.set(fieldKey, i)
        break
      }
    }
  }

  return mapping
}

// メールアドレスのバリデーション
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 日付のバリデーション（YYYY-MM-DD形式）
function isValidDate(dateString: string): boolean {
  if (!dateString) return true // 任意フィールド
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) return false

  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

// ステータスのバリデーション
function isValidStatus(status: string): boolean {
  const validStatuses = ['active', 'on_leave', 'graduated', 'withdrawn']
  return validStatuses.includes(status)
}

// 日時文字列から日付部分のみを抽出（YYYY-MM-DD形式に変換）
function extractDateFromDateTime(dateTimeStr: string): string {
  if (!dateTimeStr) return ''

  // ISO 8601形式（例: 2024-01-15T10:30:00.000Z または 2024-01-15 10:30:00）
  const match = dateTimeStr.match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) {
    return match[1]
  }

  return dateTimeStr
}

// 受講生データのバリデーションとパース
export function parseStudentsFromCSV(csvText: string): CSVParseResult {
  const lines = parseCSV(csvText)
  const students: ParsedStudent[] = []
  let totalErrors = 0

  if (lines.length === 0) {
    return { students, totalErrors }
  }

  // ヘッダー行から列マッピングを作成
  const headers = lines[0]
  const columnMapping = createColumnMapping(headers)

  // データ行をパース（2行目以降）
  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i]
    const row = i + 1
    const errors: ValidationError[] = []

    // マッピングを使用してフィールドを取得
    // Basic Information
    const external_user_id = fields[columnMapping.get('external_user_id') ?? -1]
    const real_name = fields[columnMapping.get('real_name') ?? -1]
    const name = fields[columnMapping.get('name') ?? -1]
    const email = fields[columnMapping.get('email') ?? -1]
    const phone = fields[columnMapping.get('phone') ?? -1]
    let enrollment_date = fields[columnMapping.get('enrollment_date') ?? -1]

    // Profile
    const avatar_url = fields[columnMapping.get('avatar_url') ?? -1]

    // Goals
    const goals_display = fields[columnMapping.get('goals_display') ?? -1]

    // Course & Instructor
    const course_id = fields[columnMapping.get('course_id') ?? -1]
    const assigned_instructor_id = fields[columnMapping.get('assigned_instructor_id') ?? -1]

    // Status
    const status = fields[columnMapping.get('status') ?? -1]

    // Notes
    const notes = fields[columnMapping.get('notes') ?? -1]

    // Points System
    const current_points = fields[columnMapping.get('current_points') ?? -1]
    const total_points_earned = fields[columnMapping.get('total_points_earned') ?? -1]

    // Rank System
    const current_rank = fields[columnMapping.get('current_rank') ?? -1]
    const rank_display_name = fields[columnMapping.get('rank_display_name') ?? -1]
    const rank_color = fields[columnMapping.get('rank_color') ?? -1]
    let rank_updated_at = fields[columnMapping.get('rank_updated_at') ?? -1]

    // Level System
    const level = fields[columnMapping.get('level') ?? -1]
    const current_exp = fields[columnMapping.get('current_exp') ?? -1]
    const max_exp = fields[columnMapping.get('max_exp') ?? -1]
    const total_exp = fields[columnMapping.get('total_exp') ?? -1]
    let level_updated_at = fields[columnMapping.get('level_updated_at') ?? -1]

    // Badge System
    const badge_id = fields[columnMapping.get('badge_id') ?? -1]
    const badge_name = fields[columnMapping.get('badge_name') ?? -1]
    const badge_icon = fields[columnMapping.get('badge_icon') ?? -1]
    const badge_color = fields[columnMapping.get('badge_color') ?? -1]
    let badge_level_up_at = fields[columnMapping.get('badge_level_up_at') ?? -1]

    // Value Created
    const total_value_created = fields[columnMapping.get('total_value_created') ?? -1]

    // 日時形式の場合は適切な形式に変換
    if (enrollment_date) {
      enrollment_date = extractDateFromDateTime(enrollment_date)
    }
    if (rank_updated_at) {
      rank_updated_at = rank_updated_at.trim()
    }
    if (level_updated_at) {
      level_updated_at = level_updated_at.trim()
    }
    if (badge_level_up_at) {
      badge_level_up_at = badge_level_up_at.trim()
    }

    // 必須フィールドのバリデーション
    if (!name || name.trim() === '') {
      errors.push({
        row,
        field: '氏名',
        message: '氏名は必須です'
      })
    }

    if (!email || email.trim() === '') {
      errors.push({
        row,
        field: 'メールアドレス',
        message: 'メールアドレスは必須です'
      })
    } else if (!isValidEmail(email)) {
      errors.push({
        row,
        field: 'メールアドレス',
        message: '有効なメールアドレスを入力してください'
      })
    }

    // 入会日のバリデーション
    if (enrollment_date && !isValidDate(enrollment_date)) {
      errors.push({
        row,
        field: '入会日',
        message: '日付はYYYY-MM-DD形式で入力してください（例: 2024-01-01）'
      })
    }

    // ステータスのバリデーション
    let statusValue = status?.trim() || 'active'

    // Article Platformのロール（admin/student/一般/管理者）が含まれている場合は、デフォルトの'active'にマッピング
    if (statusValue === 'admin' || statusValue === 'student' || statusValue === '一般' || statusValue === '管理者') {
      statusValue = 'active'
    }

    if (!isValidStatus(statusValue)) {
      errors.push({
        row,
        field: 'ステータス',
        message: 'ステータスは active, on_leave, graduated, withdrawn のいずれかを指定してください'
      })
    }

    totalErrors += errors.length

    // 受講生データの作成
    const studentData: Partial<TablesInsert<'students'>> = {
      // Basic Information
      external_user_id: external_user_id?.trim() || undefined,
      real_name: real_name?.trim() || undefined,
      name: name?.trim(),
      email: email?.trim(),
      phone: phone?.trim() || undefined,
      enrollment_date: enrollment_date?.trim() || undefined,

      // Profile
      avatar_url: avatar_url?.trim() || undefined,

      // Goals
      goals_display: goals_display?.trim() || undefined,

      // Course & Instructor
      course_id: course_id?.trim() || undefined,
      assigned_instructor_id: assigned_instructor_id?.trim() || undefined,

      // Status
      status: statusValue as 'active' | 'on_leave' | 'graduated' | 'withdrawn',

      // Notes
      notes: notes?.trim() || undefined,

      // Points System
      current_points: current_points?.trim() ? parseInt(current_points.trim()) : undefined,
      total_points_earned: total_points_earned?.trim() ? parseInt(total_points_earned.trim()) : undefined,

      // Rank System
      current_rank: current_rank?.trim() || undefined,
      rank_display_name: rank_display_name?.trim() || undefined,
      rank_color: rank_color?.trim() || undefined,
      rank_updated_at: rank_updated_at?.trim() || undefined,

      // Level System
      level: level?.trim() ? parseInt(level.trim()) : undefined,
      current_exp: current_exp?.trim() ? parseInt(current_exp.trim()) : undefined,
      max_exp: max_exp?.trim() ? parseInt(max_exp.trim()) : undefined,
      total_exp: total_exp?.trim() ? parseInt(total_exp.trim()) : undefined,
      level_updated_at: level_updated_at?.trim() || undefined,

      // Badge System
      badge_id: badge_id?.trim() || undefined,
      badge_name: badge_name?.trim() || undefined,
      badge_icon: badge_icon?.trim() || undefined,
      badge_color: badge_color?.trim() || undefined,
      badge_level_up_at: badge_level_up_at?.trim() || undefined,

      // Value Created
      total_value_created: total_value_created?.trim() ? parseFloat(total_value_created.trim()) : undefined,
    }

    students.push({
      data: studentData,
      errors,
      row
    })
  }

  return {
    students,
    totalErrors
  }
}

// CSVテキストを生成する関数（エクスポート用）
export function generateCSVTemplate(
  courses: Array<{ id: string; name: string }>,
  instructors: Array<{ id: string; name: string }>
): string {
  const headers = [
    '本名',
    'ユーザー名',
    'メールアドレス',
    '電話番号',
    '入会日',
    '目標表示',
    'コースID',
    '担当講師ID',
    'ステータス',
    '備考'
  ]

  const exampleRow = [
    '山田 太郎',
    'yamada_taro',
    'example@email.com',
    '090-1234-5678',
    '2024-01-01',
    'Webエンジニアとして就職する',
    courses[0]?.id || '',
    instructors[0]?.id || '',
    'active',
    '特記事項なし'
  ]

  const comments = [
    '# ステータス: active(在籍中), on_leave(休学中), graduated(卒業), withdrawn(退会)',
    `# 利用可能なコース: ${courses.map(c => `${c.name}(${c.id})`).join(', ')}`,
    `# 利用可能な講師: ${instructors.map(i => `${i.name}(${i.id})`).join(', ')}`
  ]

  return [
    headers.join(','),
    exampleRow.join(','),
    ...comments
  ].join('\n')
}
