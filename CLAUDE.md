# CLAUDE.md

## プロジェクト概要

チーム向けアイデア投票アプリ。Next.js 16 App Router + Supabase。**UIテキストはすべて日本語**で記述すること。

## コマンド

```bash
pnpm dev          # 開発サーバー起動 (http://localhost:3000)
pnpm build        # 本番ビルド (ignoreBuildErrors: true)
pnpm lint         # ESLint 実行
```

テストフレームワークは未導入。変更後は `pnpm build` と `pnpm lint` で検証すること。

## 環境変数

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase プロジェクトURL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase サービスロールキー（サーバーサイドのみ）
- `ADMIN_PASSWORD` — 管理者ログインパスワード

## アーキテクチャ

- **技術スタック:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui (new-york スタイル)
- **データベース:** Supabase (PostgreSQL)。スキーマ: `scripts/001_create_sessions.sql`, `002_create_ideas.sql`, `003_create_votes.sql`
- **Supabase クライアント:** `lib/supabase/server.ts` — サービスロールキー使用、自動トークン更新/セッション永続化なし

### 主要ルート

- `/` — セッション一覧（Public）
- `/admin` — パスワードログイン → `/admin/sessions/[sessionId]` でCRUD
- `/vote/[sessionId]` — ニックネーム → 投票 → 確認の3ステップ（Public）
- `/results/[sessionId]` — 結果表示、セッションclose時のみ（Public）

### APIルート

- `POST /api/admin/login` — パスワード認証、httpOnly cookie発行
- `POST /api/upload` — 画像アップロード（jpeg/png/gif/webp、最大5MB、Supabase Storage `idea-images` バケット）

### Server Actions

- `app/admin/actions.ts` — セッション/アイデアCRUD（`assertAdmin()` で認証チェック）
- `app/vote/actions.ts` — 投票送信（`(session_id, voter_id)` のユニーク制約で重複防止）

### 認証

- 管理者: パスワード → httpOnly cookie `admin_session`（24時間有効）
- 投票者: 匿名。`voter_id` は localStorage の UUID

## コードスタイル

- ES modules (`import/export`) を使用、CommonJS は使わない
- パス別名 `@/*` を使用（`@/components/ui/button` など）
- Server Components をデフォルトとし、`"use client"` は必要な場合のみ
- フォーム送信は Server Actions + `useActionState` パターン
- キャッシュ無効化は `revalidatePath()` を使用
- UIコンポーネントは `components/ui/` の既存 shadcn/ui を優先利用
- スタイリング: Tailwind CSS 4 + oklch CSS変数（`app/globals.css` で定義）
