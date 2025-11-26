# Supabase セットアップ手順

プロジェクトID: **niezkkqpdcnwabursgni**

## 1. Supabase プロジェクト情報の取得

1. [Supabase Dashboard](https://supabase.com/dashboard/project/niezkkqpdcnwabursgni/settings/api) にアクセス
2. **「API」** タブで以下の情報をコピー：
   - **Project URL**: `https://niezkkqpdcnwabursgni.supabase.co`
   - **anon public key**: 長いトークン文字列（`eyJ...`で始まる）

## 2. 環境変数の更新

`.env.local` ファイルを以下のように更新：

```env
NEXT_PUBLIC_SUPABASE_URL=https://niezkkqpdcnwabursgni.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ここにanon_keyを貼り付け
```

## 3. データベースマイグレーションの実行

### [SQL Editor](https://supabase.com/dashboard/project/niezkkqpdcnwabursgni/sql) で以下を順番に実行：

#### Step 1: テーブル作成
1. 「New Query」をクリック
2. `supabase/migrations/001_initial_schema.sql` の内容をコピー&ペースト
3. 「Run」をクリック

#### Step 2: RLSポリシー設定
1. 「New Query」をクリック
2. `supabase/migrations/002_rls_policies.sql` の内容をコピー&ペースト
3. 「Run」をクリック

#### Step 3: サンプルデータ挿入
1. 「New Query」をクリック
2. `supabase/migrations/003_sample_data.sql` の内容をコピー&ペースト
3. 「Run」をクリック

## 4. メール確認の無効化（開発環境用）

1. [Authentication Settings](https://supabase.com/dashboard/project/niezkkqpdcnwabursgni/auth/users) にアクセス
2. 左メニュー「Configuration」をクリック
3. 「Email Auth」セクションで **「Enable email confirmations」** をOFFにする
4. 「Save」をクリック

## 5. TypeScript型定義の再生成

```bash
cd app
npx supabase gen types typescript --project-id niezkkqpdcnwabursgni > src/types/database.ts
```

## 6. 管理者ユーザーの作成

### 方法1: アプリからサインアップ後に権限変更
1. http://localhost:3000/login にアクセス
2. 「サインアップ」タブから新規アカウントを作成
3. [Table Editor](https://supabase.com/dashboard/project/niezkkqpdcnwabursgni/editor) で `users` テーブルを開く
4. 作成したユーザーの `role` を `admin` に変更

### 方法2: SQLで直接変更
[SQL Editor](https://supabase.com/dashboard/project/niezkkqpdcnwabursgni/sql) で実行：

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## 7. 動作確認

```bash
npm run dev
```

1. http://localhost:3000/login にアクセス
2. サインアップ→ログインが正常に動作することを確認
3. ダッシュボードにアクセスできることを確認

## トラブルシューティング

### エラー: "relation does not exist"
→ マイグレーションが実行されていません。Step 3を再実行してください。

### エラー: "permission denied"
→ RLSポリシーが設定されていません。Step 3の002を再実行してください。

### サインアップ後にログインできない
→ メール確認が有効です。Step 4を確認してください。

### 管理者機能が表示されない
→ ユーザーのroleが'admin'になっていません。Step 6を実行してください。
