-- ロールのパスワード設定と追加権限
-- ※ ロール自体は supabase/postgres イメージの init-scripts で作成済み（パスワードなし）
--   ここでは docker-compose の接続文字列に合わせてパスワードを設定し、追加の権限を付与する

-- PostgREST 用: authenticator にパスワードを設定
ALTER ROLE authenticator WITH PASSWORD 'postgres';

-- Storage API 用: supabase_storage_admin にパスワードを設定
ALTER ROLE supabase_storage_admin WITH PASSWORD 'postgres';

-- Storage API が JWT の role に SET ROLE するために必要
GRANT anon TO supabase_storage_admin;
GRANT authenticated TO supabase_storage_admin;
GRANT service_role TO supabase_storage_admin;
