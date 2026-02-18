import { NextRequest, NextResponse } from "next/server"

function checkPassword(password: string): boolean {
  const envPassword = process.env.ADMIN_PASSWORD
  if (!envPassword) return false
  return password === envPassword
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { password } = body

  if (!checkPassword(password)) {
    return NextResponse.json(
      { error: "パスワードが正しくありません" },
      { status: 401 }
    )
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set("admin_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  })
  return response
}
