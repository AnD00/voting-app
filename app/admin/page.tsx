import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminLoginForm } from "./login-form"

export default async function AdminLoginPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value === "authenticated"
  if (isAdmin) redirect("/admin/sessions")

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 bg-muted/50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">管理者ログイン</h1>
          <p className="text-muted-foreground mt-2">
            管理画面にアクセスするにはパスワードを入力してください
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  )
}
