import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ResultsView } from "./results-view"

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
    title: session ? `${session.title} - 結果発表` : "結果発表",
  }
}

export default async function ResultsPage({
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

  // If session is still open, redirect to vote page
  if (!session.is_closed) {
    redirect(`/vote/${sessionId}`)
  }

  // Get ideas with vote counts
  const { data: ideas } = await supabase
    .from("ideas")
    .select("id, title, description, url, votes(count)")
    .eq("session_id", sessionId)

  const { count: totalVotes } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)

  // Sort by vote count descending
  const sortedIdeas = (ideas ?? [])
    .map((idea) => ({
      ...idea,
      voteCount: idea.votes[0]?.count ?? 0,
    }))
    .sort((a, b) => b.voteCount - a.voteCount)

  return (
    <ResultsView
      session={session}
      ideas={sortedIdeas}
      totalVotes={totalVotes ?? 0}
    />
  )
}
