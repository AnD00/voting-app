"use client"

import { useActionState, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createIdea, deleteIdea, updateIdea } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { LinkifyText } from "@/components/linkify-text"
import { Plus, Trash2, ExternalLink, Vote, ImagePlus, X, Pencil, Check } from "lucide-react"

interface Idea {
  id: string
  title: string
  description: string | null
  url: string | null
  image_url: string | null
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [ideaTitle, setIdeaTitle] = useState("")
  const [ideaDescription, setIdeaDescription] = useState("")
  const [ideaUrl, setIdeaUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      setUploadError(null)

      // Upload image first if selected
      let imageUrl = ""
      if (imageFile) {
        const uploadData = new FormData()
        uploadData.append("file", imageFile)
        uploadData.append("sessionId", sessionId)

        const res = await fetch("/api/upload", { method: "POST", body: uploadData })
        const json = await res.json()

        if (!res.ok) {
          setUploadError(json.error || "画像のアップロードに失敗しました")
          return { error: json.error || "画像のアップロードに失敗しました" }
        }
        imageUrl = json.url
      }

      formData.set("imageUrl", imageUrl)
      const result = await createIdea(formData)
      if (result?.success) {
        setIdeaTitle("")
        setIdeaDescription("")
        setIdeaUrl("")
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        formRef.current?.reset()
      }
      return result ?? null
    },
    null
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("ファイルサイズは5MB以下にしてください")
      e.target.value = ""
      return
    }

    setUploadError(null)
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">アイデアを追加</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="sessionId" value={sessionId} />
            <input type="hidden" name="imageUrl" value="" />
            <div className="flex flex-col gap-2">
              <Label htmlFor="idea-title">タイトル</Label>
              <Input
                id="idea-title"
                name="title"
                placeholder="アイデアのタイトル"
                required
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="idea-description">説明（任意）</Label>
              <Textarea
                id="idea-description"
                name="description"
                placeholder="アイデアの簡単な説明"
                rows={2}
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="idea-url">URL（任意）</Label>
              <Input
                id="idea-url"
                name="url"
                type="url"
                placeholder="https://..."
                value={ideaUrl}
                onChange={(e) => setIdeaUrl(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>スクリーンショット（任意）</Label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="プレビュー"
                    className="max-h-40 rounded-lg border border-border/30 object-contain"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-4 py-3 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors text-muted-foreground text-sm">
                  <ImagePlus className="h-5 w-5" />
                  画像を選択（JPG, PNG, GIF, WebP / 5MB以下）
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
            {(state?.error || uploadError) && (
              <p className="text-sm text-destructive">{uploadError || state?.error}</p>
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
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [title, setTitle] = useState(idea.title)
  const [description, setDescription] = useState(idea.description ?? "")
  const [url, setUrl] = useState(idea.url ?? "")
  const [imageUrl, setImageUrl] = useState(idea.image_url)
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setEditError("ファイルサイズは5MB以下にしてください")
      e.target.value = ""
      return
    }

    setEditError(null)
    setNewImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setEditImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditError(null)
    setTitle(idea.title)
    setDescription(idea.description ?? "")
    setUrl(idea.url ?? "")
    setImageUrl(idea.image_url)
    setNewImageFile(null)
    setEditImagePreview(null)
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setEditError("タイトルを入力してください")
      return
    }

    setIsSaving(true)
    setEditError(null)

    let finalImageUrl = imageUrl

    // Upload new image if selected
    if (newImageFile) {
      const uploadData = new FormData()
      uploadData.append("file", newImageFile)
      uploadData.append("sessionId", sessionId)

      const res = await fetch("/api/upload", { method: "POST", body: uploadData })
      const json = await res.json()

      if (!res.ok) {
        setEditError(json.error || "画像のアップロードに失敗しました")
        setIsSaving(false)
        return
      }
      finalImageUrl = json.url
    }

    const result = await updateIdea(idea.id, sessionId, {
      title,
      description,
      url,
      imageUrl: finalImageUrl,
    })

    setIsSaving(false)

    if (result.error) {
      setEditError(result.error)
      return
    }

    setIsEditing(false)
    setNewImageFile(null)
    setEditImagePreview(null)
    router.refresh()
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 p-3 bg-muted/50 rounded-lg border-2 border-primary/20 overflow-hidden">
        <div className="flex flex-col gap-2">
          <Label className="text-xs">タイトル</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="アイデアのタイトル"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs">説明（任意）</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="アイデアの簡単な説明"
            rows={2}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs">URL（任意）</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            type="url"
            placeholder="https://..."
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs">スクリーンショット（任意）</Label>
          {(editImagePreview || imageUrl) ? (
            <div className="relative inline-block">
              <img
                src={editImagePreview || imageUrl!}
                alt="プレビュー"
                className="max-h-32 rounded-lg border border-border/30 object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setImageUrl(null)
                  setNewImageFile(null)
                  setEditImagePreview(null)
                  if (editFileInputRef.current) editFileInputRef.current.value = ""
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors text-muted-foreground text-xs">
              <ImagePlus className="h-4 w-4" />
              画像を選択
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleEditFileChange}
              />
            </label>
          )}
        </div>
        {editError && (
          <p className="text-sm text-destructive">{editError}</p>
        )}
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
            キャンセル
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Check className="h-4 w-4 mr-1" />
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
      {idea.image_url && (
        <img
          src={idea.image_url}
          alt={idea.title}
          className="w-16 h-16 rounded-md object-cover shrink-0 border border-border/30"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground break-words">{idea.title}</p>
        {idea.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 whitespace-pre-wrap break-words"><LinkifyText>{idea.description}</LinkifyText></p>
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
        className="text-muted-foreground hover:text-primary shrink-0"
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">編集</span>
      </Button>
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
