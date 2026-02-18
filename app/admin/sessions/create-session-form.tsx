"use client"

import { useActionState, useRef } from "react"
import { createSession } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"

export function CreateSessionForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createSession(formData)
      if (result?.success) {
        formRef.current?.reset()
      }
      return result ?? null
    },
    null
  )

  return (
    <Card>
      <CardContent className="pt-6">
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              name="title"
              placeholder="例：2026年Q1 新規事業アイデア投票"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">説明（任意）</Label>
            <Input
              id="description"
              name="description"
              placeholder="例：今日中に投票してね！"
            />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" disabled={isPending}>
            <Plus className="h-4 w-4 mr-1" />
            {isPending ? "作成中..." : "投票を作成"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
