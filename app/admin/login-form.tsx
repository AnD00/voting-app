"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Lock } from "lucide-react"

export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "ログインに失敗しました")
        setIsPending(false)
        return
      }

      // Use hard navigation to ensure the cookie is sent on the next request
      window.location.href = "/admin/sessions"
    } catch {
      setError("ログインに失敗しました")
      setIsPending(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">パスワード</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="管理者パスワード"
                className="pl-10"
                required
                autoFocus
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
