'use client'

import { useState, useRef } from 'react'
import { Upload, Download, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface CSVImportProps {
  courses: Array<{ id: string; name: string }>
  instructors: Array<{ id: string; name: string }>
}

interface ValidationError {
  row: number
  field: string
  message: string
}

interface ImportResult {
  success: number
  failed: number
  errors: ValidationError[]
}

export function CSVImport({ courses, instructors }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: 'エラー',
          description: 'CSVファイルを選択してください',
          variant: 'destructive',
        })
        return
      }
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'エラー',
        description: 'ファイルを選択してください',
        variant: 'destructive',
      })
      return
    }

    setImporting(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/students/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'インポートに失敗しました')
      }

      setResult(data)

      if (data.success > 0) {
        toast({
          title: 'インポート完了',
          description: `${data.success}件の受講生を登録しました`,
        })
        router.refresh()
      }

      if (data.failed > 0) {
        toast({
          title: '一部エラー',
          description: `${data.failed}件の登録に失敗しました`,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Import error:', error)
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'インポートに失敗しました',
        variant: 'destructive',
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const headers = [
      '氏名',
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
      'example@email.com',
      '090-1234-5678',
      '2024-01-01',
      'Webエンジニアとして就職する',
      courses[0]?.id || '',
      instructors[0]?.id || '',
      'active',
      '特記事項なし'
    ]

    const csv = [
      headers.join(','),
      exampleRow.join(','),
      '# ステータス: active(在籍中), on_leave(休学中), graduated(卒業), withdrawn(退会)'
    ].join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'students_import_template.csv'
    link.click()
  }

  const clearFile = () => {
    setFile(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          CSV一括登録
        </CardTitle>
        <CardDescription>
          CSVファイルから複数の受講生を一括で登録できます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            テンプレートをダウンロード
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">CSVファイルの形式:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>1行目: ヘッダー行（氏名、メールアドレス、電話番号、入会日、目標表示、コースID、担当講師ID、ステータス、備考）</li>
                <li>2行目以降: データ行</li>
                <li>必須項目: 氏名、メールアドレス</li>
                <li>ステータス: active(在籍中), on_leave(休学中), graduated(卒業), withdrawn(退会)</li>
                <li>日付形式: YYYY-MM-DD（例: 2024-01-01）</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Button type="button" variant="outline" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  ファイルを選択
                </span>
              </Button>
            </label>

            {file && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-2">
                  {file.name}
                  <button
                    onClick={clearFile}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </div>
            )}
          </div>

          {file && (
            <Button
              onClick={handleImport}
              disabled={importing}
              className="w-full"
            >
              {importing ? 'インポート中...' : 'インポート開始'}
            </Button>
          )}
        </div>

        {result && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">成功</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {result.success}件
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">失敗</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {result.failed}件
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {result.errors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">エラー詳細:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription>
                        <span className="font-semibold">行 {error.row}:</span> {error.field} - {error.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
