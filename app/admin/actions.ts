"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function assertAdmin() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value === "authenticated"
  if (!isAdmin) {
    throw new Error("Unauthorized")
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  redirect("/admin")
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

export async function updateSession(
  sessionId: string,
  data: { title: string; description: string }
) {
  await assertAdmin()

  if (!data.title.trim()) {
    return { error: "タイトルを入力してください" }
  }

  const supabase = createClient()
  const { error } = await supabase
    .from("sessions")
    .update({
      title: data.title.trim(),
      description: data.description?.trim() || null,
    })
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
  const imageUrl = formData.get("imageUrl") as string

  if (!title.trim()) {
    return { error: "タイトルを入力してください" }
  }

  const supabase = createClient()
  const { error } = await supabase.from("ideas").insert({
    session_id: sessionId,
    title: title.trim(),
    description: description?.trim() || null,
    url: url?.trim() || null,
    image_url: imageUrl?.trim() || null,
  })

  if (error) {
    return { error: "作成に失敗しました: " + error.message }
  }

  revalidatePath(`/admin/sessions/${sessionId}`)
  return { success: true }
}

export async function updateIdea(
  ideaId: string,
  sessionId: string,
  data: { title: string; description: string; url: string; imageUrl: string | null }
) {
  await assertAdmin()

  if (!data.title.trim()) {
    return { error: "タイトルを入力してください" }
  }

  const supabase = createClient()

  // If image was removed or replaced, delete old image from storage
  const { data: existing } = await supabase
    .from("ideas")
    .select("image_url")
    .eq("id", ideaId)
    .single()

  if (existing?.image_url && existing.image_url !== data.imageUrl) {
    const bucketUrl = "/storage/v1/object/public/idea-images/"
    const idx = existing.image_url.indexOf(bucketUrl)
    if (idx !== -1) {
      const path = existing.image_url.substring(idx + bucketUrl.length)
      await supabase.storage.from("idea-images").remove([path])
    }
  }

  const { error } = await supabase
    .from("ideas")
    .update({
      title: data.title.trim(),
      description: data.description?.trim() || null,
      url: data.url?.trim() || null,
      image_url: data.imageUrl || null,
    })
    .eq("id", ideaId)

  if (error) {
    return { error: "更新に失敗しました: " + error.message }
  }

  revalidatePath(`/admin/sessions/${sessionId}`)
  return { success: true }
}

export async function deleteIdea(ideaId: string, sessionId: string) {
  await assertAdmin()

  const supabase = createClient()

  // Get idea to check for image
  const { data: idea } = await supabase
    .from("ideas")
    .select("image_url")
    .eq("id", ideaId)
    .single()

  // Delete image from storage if exists
  if (idea?.image_url) {
    const bucketUrl = "/storage/v1/object/public/idea-images/"
    const idx = idea.image_url.indexOf(bucketUrl)
    if (idx !== -1) {
      const path = idea.image_url.substring(idx + bucketUrl.length)
      await supabase.storage.from("idea-images").remove([path])
    }
  }

  const { error } = await supabase.from("ideas").delete().eq("id", ideaId)

  if (error) {
    return { error: "削除に失敗しました: " + error.message }
  }

  revalidatePath(`/admin/sessions/${sessionId}`)
  return { success: true }
}
