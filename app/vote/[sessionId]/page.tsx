import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { VotingFlow } from "./voting-flow"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const supabase = createClient()
  const { data: session } = await supabase
    .from("sessions")
    .select("title")
    .eq("id", sessionId)
    .single()

  return {
    title: session ? `${session.title} - 投票` : "投票",
  }
}

export default async function VotePage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const supabase = createClient()

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single()

  if (!session) notFound()

  if (session.is_closed) {
    redirect(`/results/${sessionId}`)
  }

  const { data: ideas } = await supabase
    .from("ideas")
    .select("id, title, url")
    .eq("session_id", sessionId)

  const { count: totalVotes } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)

  return (
    <VotingFlow
      session={session}
      ideas={ideas ?? []}
      totalVotes={totalVotes ?? 0}
    />
  )
}
