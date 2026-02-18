"use client"

import { useActionState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createIdea, deleteIdea } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, ExternalLink, Vote } from "lucide-react"

interface Idea {
  id: string
  title: string
  description: string | null
  url: string | null
  created_at: string
  votes: { count: number }[]
}

export function IdeaManager({
  sessionId,
  ideas,
  isClosed,
}: {
  sessionId: string
  ideas: Idea[]
  isClosed: boolean
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createIdea(formData)
      if (result?.success) {
        formRef.current?.reset()
      }
      return result ?? null
    },
    null
  )

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">アイデアを追加</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="sessionId" value={sessionId} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="idea-title">タイトル</Label>
              <Input
                id="idea-title"
                name="title"
                placeholder="アイデアのタイトル"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="idea-description">説明（任意）</Label>
              <Textarea
                id="idea-description"
                name="description"
                placeholder="アイデアの簡単な説明"
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="idea-url">URL（任意）</Label>
              <Input
                id="idea-url"
                name="url"
                type="url"
                placeholder="https://..."
              />
            </div>
            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <Button type="submit" disabled={isPending}>
              <Plus className="h-4 w-4 mr-1" />
              {isPending ? "追加中..." : "アイデアを追加"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            登録済みアイデア ({ideas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ideas.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              まだアイデアが登録されていません
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {ideas.map((idea) => (
                <IdeaRow key={idea.id} idea={idea} sessionId={sessionId} showVotes={isClosed} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function IdeaRow({
  idea,
  sessionId,
  showVotes,
}: {
  idea: Idea
  sessionId: string
  showVotes: boolean
}) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{idea.title}</p>
        {idea.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{idea.description}</p>
        )}
        {idea.url && (
          <a
            href={idea.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
          >
            <ExternalLink className="h-3 w-3" />
            リンクを開く
          </a>
        )}
      </div>
      {showVotes && (
        <span className="text-sm text-muted-foreground flex items-center gap-1 shrink-0">
          <Vote className="h-3.5 w-3.5" />
          {idea.votes[0]?.count ?? 0}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-destructive shrink-0"
        onClick={async () => {
          if (!confirm("このアイデアを削除しますか？")) return
          await deleteIdea(idea.id, sessionId)
          router.refresh()
        }}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">削除</span>
      </Button>
    </div>
  )
}
