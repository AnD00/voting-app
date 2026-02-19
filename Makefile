.PHONY: up down logs logs-app reset clean

# ローカル開発環境を起動
up:
	docker compose up --build -d
	@echo ""
	@echo "ローカル開発環境が起動しました"
	@echo "  アプリ:   http://localhost:3000"
	@echo "  Supabase: http://localhost:54321"
	@echo "  Studio:   http://localhost:54323"
	@echo ""

# 停止
down:
	docker compose down

# ログ表示
logs:
	docker compose logs -f

# アプリのログのみ
logs-app:
	docker compose logs -f app

# DB リセット（ボリューム削除 → 再起動）
reset:
	docker compose down -v
	docker compose up --build -d
	@echo ""
	@echo "データベースをリセットしました"

# 全クリーンアップ（ボリューム + イメージ削除）
clean:
	docker compose down -v --rmi local
