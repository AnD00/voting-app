"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toggleSessionClosed, deleteSession, updateSession } from "../../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Vote, Lock, Unlock, Trash2, ExternalLink, Copy, Check, Pencil, X } from "lucide-react"

interface Session {
  id: string
  title: string
  description: string | null
  is_closed: boolean
  created_at: string
}

export function SessionControls({
  session,
  totalVotes,
}: {
  session: Session
  totalVotes: number
}) {
  const router = useRouter()
  const [isToggling, setIsToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editTitle, setEditTitle] = useState(session.title)
  const [editDescription, setEditDescription] = useState(session.description || "")

  const votePath = `/vote/${session.id}`

  const handleCopy = async () => {
    const fullUrl = `${window.location.origin}${votePath}`
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="overflow-hidden">
        {isEditing ? (
          <div className="flex flex-col gap-3 overflow-hidden">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="タイトル"
            />
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="説明（任意）"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={isSaving}
                onClick={async () => {
                  setIsSaving(true)
                  const result = await updateSession(session.id, {
                    title: editTitle,
                    description: editDescription,
                  })
                  setIsSaving(false)
                  if (!result?.error) {
                    setIsEditing(false)
                    router.refresh()
                  }
                }}
              >
                {isSaving ? "保存中..." : "保存"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditTitle(session.title)
                  setEditDescription(session.description || "")
                  setIsEditing(false)
                }}
              >
                <X className="h-4 w-4 mr-1" />
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3 overflow-hidden">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2 min-w-0">
                <CardTitle className="text-xl break-words min-w-0">{session.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
              {session.description && (
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">{session.description}</p>
              )}
            </div>
            <Badge variant={session.is_closed ? "secondary" : "default"} className="shrink-0">
              {session.is_closed ? "締切済" : "投票中"}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Vote className="h-4 w-4" />
          <span>現在 {totalVotes} 票</span>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">投票URL:</p>
          <div className="flex items-center gap-2">
            <code suppressHydrationWarning className="flex-1 text-xs bg-muted px-3 py-2 rounded-md break-all text-muted-foreground">
              {votePath}
            </code>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button
            variant={session.is_closed ? "default" : "secondary"}
            size="sm"
            disabled={isToggling}
            onClick={async () => {
              setIsToggling(true)
              await toggleSessionClosed(session.id, !session.is_closed)
              setIsToggling(false)
              router.refresh()
            }}
          >
            {session.is_closed ? (
              <>
                <Unlock className="h-4 w-4 mr-1" />
                投票を再開する
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-1" />
                投票を締め切る
              </>
            )}
          </Button>

          <a href={session.is_closed ? `/results/${session.id}` : `/vote/${session.id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              {session.is_closed ? "結果を見る" : "投票画面を見る"}
            </Button>
          </a>

          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={async () => {
              if (!confirm("この投票を削除しますか？すべてのアイデアと投票データが失われます。")) return
              setIsDeleting(true)
              const result = await deleteSession(session.id)
              if (!result?.error) {
                window.location.href = "/admin/sessions"
              }
              setIsDeleting(false)
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            削除
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
