import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Admin auth check
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value === "authenticated"
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const sessionId = formData.get("sessionId") as string | null

  if (!file || !sessionId) {
    return NextResponse.json({ error: "File and sessionId are required" }, { status: 400 })
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "画像ファイル（JPG, PNG, GIF, WebP）のみアップロードできます" }, { status: 400 })
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "ファイルサイズは5MB以下にしてください" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() || "png"
  const fileName = `${sessionId}/${crypto.randomUUID()}.${ext}`

  const supabase = createClient()
  const { error } = await supabase.storage
    .from("idea-images")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    return NextResponse.json({ error: "アップロードに失敗しました: " + error.message }, { status: 500 })
  }

  const { data: urlData } = supabase.storage
    .from("idea-images")
    .getPublicUrl(fileName)

  return NextResponse.json({ url: urlData.publicUrl })
}
