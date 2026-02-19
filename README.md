# アイデア投票アプリ

チームでアイデアを出し合い、匿名で投票するための Web アプリケーションです。

## 主な機能

- **セッション管理** — 管理者が投票セッションを作成・開閉
- **アイデア登録** — タイトル・説明・画像・デモ URL 付きでアイデアを登録
- **匿名投票** — ニックネームを入力して 1 人 1 票で投票（重複投票防止）
- **結果発表** — 紙吹雪アニメーション付きのランキング表示（同率順位対応）

## 技術スタック

| カテゴリ | 技術 |
| --- | --- |
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| UI | React 19, shadcn/ui (Radix UI), Tailwind CSS 4 |
| データベース | Supabase (PostgreSQL) |
| ストレージ | Supabase Storage (画像アップロード) |
| アニメーション | canvas-confetti, CSS Keyframes |
| パッケージマネージャ | pnpm |

## セットアップ

### 前提条件

- Node.js 18 以上
- pnpm
- Supabase プロジェクト

### 1. リポジトリのクローンと依存関係のインストール

```bash
git clone https://github.com/AnD00/voting-app.git
cd voting-app
pnpm install
```

### 2. 環境変数の設定

`.env.local` を作成し、以下を設定します。

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
```

### 3. データベースのセットアップ

Supabase の SQL Editor で以下のスクリプトを順番に実行します。

```bash
scripts/001_create_sessions.sql
scripts/002_create_ideas.sql
scripts/003_create_votes.sql
```

また、Supabase Storage に `idea-images` バケットを作成し、パブリックアクセスを有効にしてください。

### 4. 開発サーバーの起動

```bash
pnpm dev
```

http://localhost:3000 でアクセスできます。

## コマンド一覧

| コマンド | 説明 |
| --- | --- |
| `pnpm dev` | 開発サーバーを起動 |
| `pnpm build` | プロダクションビルド |
| `pnpm start` | プロダクションサーバーを起動 |
| `pnpm lint` | ESLint を実行 |

## アプリケーション構成

```
app/
├── page.tsx                        # トップページ（セッション一覧）
├── admin/
│   ├── page.tsx                    # 管理者ログイン
│   ├── actions.ts                  # Server Actions（セッション・アイデア CRUD）
│   └── sessions/
│       ├── page.tsx                # セッション管理
│       └── [sessionId]/page.tsx    # セッション詳細（アイデア管理・投票者一覧）
├── vote/
│   ├── actions.ts                  # Server Actions（投票処理）
│   └── [sessionId]/page.tsx        # 投票画面（ニックネーム入力 → 選択 → 完了）
├── results/
│   └── [sessionId]/page.tsx        # 結果発表画面
└── api/
    ├── admin/login/route.ts        # 管理者認証 API
    └── upload/route.ts             # 画像アップロード API
```

## 利用フロー

### 管理者

1. `/admin` にアクセスしてパスワードでログイン
2. セッションを作成し、アイデアを登録（画像・デモ URL は任意）
3. 投票 URL をチームに共有
4. 投票が集まったらセッションを締め切り、結果を公開

### 投票者

1. 共有された投票 URL（`/vote/[sessionId]`）にアクセス
2. ニックネームを入力
3. アイデア一覧から 1 つ選んで投票
4. セッション締め切り後、`/results/[sessionId]` で結果を確認

## データベーススキーマ

| テーブル | 説明 |
| --- | --- |
| `sessions` | 投票セッション（タイトル、説明、開閉状態） |
| `ideas` | アイデア（タイトル、説明、画像 URL、デモ URL） |
| `votes` | 投票レコード（セッション、アイデア、投票者ニックネーム、投票者 ID） |

重複投票は `voter_id`（localStorage に保存される UUID）による一意制約で防止されます。
