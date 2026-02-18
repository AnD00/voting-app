"use server"

import { createClient } from "@/lib/supabase/server"

export async function getSessionWithIdeas(sessionId: string) {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single()

  if (sessionError || !session) {
    return { error: "投票が見つかりません" }
  }

  const { data: ideas } = await supabase
    .from("ideas")
    .select("id, title, url")
    .eq("session_id", sessionId)

  const { count: totalVotes } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)

  return {
    session,
    ideas: ideas ?? [],
    totalVotes: totalVotes ?? 0,
  }
}

export async function submitVote(
  sessionId: string,
  ideaId: string,
  nickname: string,
  voterId: string
) {
  const supabase = createClient()

  // Check if session is still open
  const { data: session } = await supabase
    .from("sessions")
    .select("is_closed")
    .eq("id", sessionId)
    .single()

  if (!session || session.is_closed) {
    return { error: "この投票は締め切られています" }
  }

  // Check if voter already voted
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("session_id", sessionId)
    .eq("voter_id", voterId)
    .maybeSingle()

  if (existingVote) {
    return { error: "すでに投票済みです" }
  }

  // Insert vote
  const { error } = await supabase.from("votes").insert({
    session_id: sessionId,
    idea_id: ideaId,
    voter_nickname: nickname.trim(),
    voter_id: voterId,
  })

  if (error) {
    if (error.code === "23505") {
      return { error: "すでに投票済みです" }
    }
    return { error: "投票に失敗しました: " + error.message }
  }

  return { success: true }
}
