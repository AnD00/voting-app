import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CreateSessionForm } from "./create-session-form"
import { SessionList } from "./session-list"
import { AdminHeader } from "../admin-header"

export default async function AdminSessionsPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value === "authenticated"
  if (!isAdmin) redirect("/admin")

  const supabase = createClient()
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*, ideas(count), votes(count)")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-dvh bg-muted/50">
      <AdminHeader />
      <main className="max-w-2xl mx-auto p-4 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">新しい投票を作成</h2>
          <CreateSessionForm />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">投票一覧</h2>
          <SessionList sessions={sessions ?? []} />
        </div>
      </main>
    </div>
  )
}
