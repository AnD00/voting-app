"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

async function assertAdmin() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value === "authenticated"
  if (!isAdmin) {
    throw new Error("Unauthorized")
  }
}

export async function createSession(formData: FormData) {
  await assertAdmin()

  const title = formData.get("title") as string
  const description = formData.get("description") as string

  if (!title.trim()) {
    return { error: "タイトルを入力してください" }
  }

  const supabase = createClient()
  const { error } = await supabase.from("sessions").insert({
    title: title.trim(),
    description: description?.trim() || null,
  })

  if (error) {
    return { error: "作成に失敗しました: " + error.message }
  }

  revalidatePath("/admin/sessions")
  revalidatePath("/")
  return { success: true }
}

export async function deleteSession(sessionId: string) {
  await assertAdmin()

  const supabase = createClient()
  const { error } = await supabase.from("sessions").delete().eq("id", sessionId)

  if (error) {
    return { error: "削除に失敗しました: " + error.message }
  }

  revalidatePath("/admin/sessions")
  revalidatePath("/")
  return { success: true }
}

export async function toggleSessionClosed(sessionId: string, isClosed: boolean) {
  await assertAdmin()

  const supabase = createClient()
  const { error } = await supabase
    .from("sessions")
    .update({ is_closed: isClosed })
    .eq("id", sessionId)

  if (error) {
    return { error: "更新に失敗しました: " + error.message }
  }

  revalidatePath(`/admin/sessions/${sessionId}`)
  revalidatePath(`/vote/${sessionId}`)
  revalidatePath(`/results/${sessionId}`)
  revalidatePath("/")
  return { success: true }
}

export async function createIdea(formData: FormData) {
  await assertAdmin()

  const sessionId = formData.get("sessionId") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const url = formData.get("url") as string

  if (!title.trim()) {
    return { error: "タイトルを入力してください" }
  }

  const supabase = createClient()
  const { error } = await supabase.from("ideas").insert({
    session_id: sessionId,
    title: title.trim(),
    description: description?.trim() || null,
    url: url?.trim() || null,
  })

  if (error) {
    return { error: "作成に失敗しました: " + error.message }
  }

  revalidatePath(`/admin/sessions/${sessionId}`)
  return { success: true }
}

export async function deleteIdea(ideaId: string, sessionId: string) {
  await assertAdmin()

  const supabase = createClient()
  const { error } = await supabase.from("ideas").delete().eq("id", ideaId)

  if (error) {
    return { error: "削除に失敗しました: " + error.message }
  }

  revalidatePath(`/admin/sessions/${sessionId}`)
  return { success: true }
}
