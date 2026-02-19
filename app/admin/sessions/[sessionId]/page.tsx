import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "../../admin-header"
import { SessionControls } from "./session-controls"
import { IdeaManager } from "./idea-manager"
import { VoterList } from "./voter-list"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AdminSessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value === "authenticated"
  if (!isAdmin) redirect("/admin")

  const { sessionId } = await params
  const supabase = createClient()

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single()

  if (!session) notFound()

  const { data: ideas } = await supabase
    .from("ideas")
    .select("*, votes(count)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })

  const { count: totalVotes } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)

  const { data: votes } = await supabase
    .from("votes")
    .select("id, voter_nickname, voter_id, created_at, ideas(title)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })

  return (
    <div className="min-h-dvh bg-muted/50">
      <AdminHeader />
      <main className="max-w-2xl mx-auto p-4 flex flex-col gap-6">
        <Link
          href="/admin/sessions"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          投票一覧に戻る
        </Link>

        <SessionControls session={session} totalVotes={totalVotes ?? 0} />

        <IdeaManager
          sessionId={sessionId}
          ideas={ideas ?? []}
          isClosed={session.is_closed}
        />

        <VoterList votes={(votes as any) ?? []} />
      </main>
    </div>
  )
}
