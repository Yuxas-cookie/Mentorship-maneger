# Google OAuth 設定手順

## 📋 概要

このガイドでは、Mentorship ManagerアプリケーションでGoogle認証を有効化する手順を説明します。

## ✅ 前提条件

- Googleアカウント
- Supabaseプロジェクト（ID: niezkkqpdcnwabursgni）
- 本番環境のURL（開発環境は`http://localhost:3000`）

## 🚀 セットアップ手順

### Step 1: Google Cloud Consoleの設定

#### 1.1 プロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. Googleアカウントでログイン
3. 左上の「プロジェクトを選択」→「新しいプロジェクト」をクリック
4. プロジェクト名を入力（例：`mentorship-manager`）
5. 「作成」をクリック
6. 作成したプロジェクトを選択

#### 1.2 OAuth同意画面の設定

1. 左メニュー「APIとサービス」→「OAuth同意画面」を選択
2. User Type: **外部** を選択
3. 「作成」をクリック

**アプリ情報の入力:**
- アプリ名: `Mentorship Manager`
- ユーザーサポートメール: あなたのメールアドレス
- アプリのロゴ: （オプション）
- アプリのホームページ: `https://niezkkqpdcnwabursgni.supabase.co`（または本番URL）
- デベロッパーの連絡先情報: あなたのメールアドレス

4. 「保存して次へ」をクリック

**スコープ:**
- デフォルトのまま「保存して次へ」

**テストユーザー:**
- 開発中は不要（本番公開時に追加）
- 「保存して次へ」

5. 「ダッシュボードに戻る」をクリック

#### 1.3 OAuth認証情報の作成

1. 左メニュー「APIとサービス」→「認証情報」を選択
2. 「+認証情報を作成」→「OAuth クライアント ID」をクリック
3. アプリケーションの種類: **ウェブアプリケーション** を選択
4. 名前を入力（例：`Mentorship Manager Web`）

**承認済みの JavaScript 生成元:**
```
http://localhost:3000
```
（本番環境の場合は本番URLも追加）

**承認済みのリダイレクト URI:**
```
https://niezkkqpdcnwabursgni.supabase.co/auth/v1/callback
```
（本番環境で独自ドメインを使う場合はそのURLも追加）

5. 「作成」をクリック

6. 表示される **クライアントID** と **クライアントシークレット** をコピー
   - ⚠️ この情報は再度表示されない場合があるので、安全な場所に保存してください

### Step 2: Supabaseの設定

#### 2.1 Google認証の有効化

1. [Supabase Dashboard - Authentication Providers](https://supabase.com/dashboard/project/niezkkqpdcnwabursgni/auth/providers) にアクセス

2. 「Google」を見つけて展開

3. 「Google Enabled」をONにする

4. 以下の情報を入力:
   - **Client ID (for OAuth)**: Google CloudでコピーしたクライアントID
   - **Client Secret (for OAuth)**: Google Cloudでコピーしたクライアントシークレット

5. 「Save」をクリック

#### 2.2 Redirect URLの確認

Supabaseの設定画面に表示される **Callback URL** を確認:
```
https://niezkkqpdcnwabursgni.supabase.co/auth/v1/callback
```

この URLがGoogle Cloud Consoleの「承認済みのリダイレクト URI」に含まれていることを確認してください。

### Step 3: アプリケーションのテスト

#### 3.1 開発サーバーの起動

```bash
npm run dev
```

#### 3.2 Google認証のテスト

1. http://localhost:3000/login にアクセス

2. 「ログイン」タブまたは「サインアップ」タブで「Googleでログイン」ボタンをクリック

3. Googleのログイン画面にリダイレクトされます

4. Googleアカウントを選択してログイン

5. 認証が成功すると、自動的にダッシュボードにリダイレクトされます

6. 初回ログイン時は、`public.users` テーブルに自動的にユーザーレコードが作成されます（トリガー機能）

### Step 4: トラブルシューティング

#### エラー: "redirect_uri_mismatch"

**原因:** Google Cloud ConsoleのリダイレクトURIとSupabaseのCallback URLが一致していない

**解決方法:**
1. Supabaseのダッシュボードで正確なCallback URLを確認
2. Google Cloud Consoleの「承認済みのリダイレクト URI」に同じURLを追加
3. 数分待ってから再試行（設定の反映に時間がかかる場合があります）

#### エラー: "Access blocked: This app's request is invalid"

**原因:** OAuth同意画面の設定が不完全

**解決方法:**
1. Google Cloud ConsoleのOAuth同意画面に戻る
2. すべての必須フィールドが入力されていることを確認
3. 「公開ステータス」が「テスト中」になっていることを確認

#### Googleログイン後にダッシュボードが表示されない

**原因:** ユーザーレコードが作成されていない、またはロールが設定されていない

**解決方法:**
1. Supabase Dashboardの[Table Editor](https://supabase.com/dashboard/project/niezkkqpdcnwabursgni/editor)で`users`テーブルを確認
2. ユーザーレコードが存在することを確認
3. `role`が`instructor`または`admin`に設定されていることを確認

#### ユーザーレコードが自動作成されない

**原因:** トリガーが正しく設定されていない

**解決方法:**
1. [SQL Editor](https://supabase.com/dashboard/project/niezkkqpdcnwabursgni/sql)で以下を確認:

```sql
-- トリガーの確認
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 関数の確認
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

2. トリガーが存在しない場合は、`supabase/migrations/001_initial_schema.sql`を再実行

## 🔒 セキュリティのベストプラクティス

1. **クライアントシークレットの保護**
   - クライアントシークレットは絶対にコードにハードコーディングしない
   - GitHubなどのバージョン管理にコミットしない
   - Supabaseダッシュボードで安全に管理

2. **本番環境の設定**
   - 本番環境では独自ドメインを使用
   - HTTPSを必須にする
   - 承認済みURIを本番URLのみに制限

3. **OAuth同意画面**
   - 本番公開前に「公開」ステータスに変更
   - プライバシーポリシーと利用規約のURLを追加
   - Google の審査を受ける（大規模アプリの場合）

## 📚 参考リンク

- [Supabase Auth - Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth 2.0 ガイド](https://developers.google.com/identity/protocols/oauth2)

## ✅ セットアップ完了チェックリスト

- [ ] Google Cloud Consoleでプロジェクトを作成
- [ ] OAuth同意画面を設定
- [ ] OAuth認証情報（クライアントID・シークレット）を作成
- [ ] 承認済みリダイレクトURIを設定
- [ ] SupabaseでGoogle認証を有効化
- [ ] クライアントID・シークレットをSupabaseに設定
- [ ] ローカル環境でテスト成功
- [ ] ユーザーレコードの自動作成を確認

全てチェックが付いたら、Google認証の設定は完了です！🎉
