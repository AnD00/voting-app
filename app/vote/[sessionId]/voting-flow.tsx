"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { submitVote } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Vote, Users, PartyPopper, Sparkles, X } from "lucide-react"
import { LinkifyText } from "@/components/linkify-text"

interface Session {
  id: string
  title: string
  description: string | null
}

interface Idea {
  id: string
  title: string
  description: string | null
  url: string | null
  image_url: string | null
}

type Step = "check" | "nickname" | "vote" | "complete"

function getVoterId(): string {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem("voter_id")
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem("voter_id", id)
  }
  return id
}

function hasVoted(sessionId: string): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(`voted_${sessionId}`) === "true"
}

function markVoted(sessionId: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(`voted_${sessionId}`, "true")
}

function getSavedNickname(sessionId: string): string {
  if (typeof window === "undefined") return ""
  return sessionStorage.getItem(`nickname_${sessionId}`) ?? ""
}

function saveNickname(sessionId: string, nickname: string) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(`nickname_${sessionId}`, nickname)
}

export function VotingFlow({
  session,
  ideas,
  totalVotes,
}: {
  session: Session
  ideas: Idea[]
  totalVotes: number
}) {
  const [step, setStep] = useState<Step>("check")
  const [nickname, setNickname] = useState(() => getSavedNickname(session.id))
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voteCount, setVoteCount] = useState(totalVotes)
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null)

  // Prevent background scroll when lightbox is open
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [lightboxImage])

  // Shuffle ideas on mount
  const shuffledIdeas = useMemo(() => {
    return [...ideas].sort(() => Math.random() - 0.5)
  }, [ideas])

  // Check if already voted or nickname already entered
  useEffect(() => {
    if (hasVoted(session.id)) {
      setStep("complete")
    } else if (getSavedNickname(session.id)) {
      setStep("vote")
    } else {
      setStep("nickname")
    }
  }, [session.id])

  const handleSubmitVote = useCallback(async () => {
    if (!selectedIdea || !nickname.trim()) return
    setIsSubmitting(true)
    setError(null)

    const voterId = getVoterId()
    const result = await submitVote(session.id, selectedIdea, nickname.trim(), voterId, comment || undefined)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      if (result.error === "すでに投票済みです") {
        markVoted(session.id)
        setStep("complete")
      }
      return
    }

    markVoted(session.id)
    setVoteCount((prev) => prev + 1)
    setStep("complete")
    setIsSubmitting(false)
  }, [selectedIdea, nickname, comment, session.id])

  if (step === "check") {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-bold text-foreground text-lg text-balance break-words">{session.title}</h1>
          {session.description && (
            <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap break-words"><LinkifyText>{session.description}</LinkifyText></p>
          )}
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{voteCount}人が投票済み</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {step === "nickname" && (
          <NicknameStep
            nickname={nickname}
            setNickname={setNickname}
            onNext={() => {
              saveNickname(session.id, nickname)
              setStep("vote")
            }}
          />
        )}

        {step === "vote" && (
          <VoteStep
            ideas={shuffledIdeas}
            selectedIdea={selectedIdea}
            setSelectedIdea={setSelectedIdea}
            comment={comment}
            setComment={setComment}
            onSubmit={handleSubmitVote}
            isSubmitting={isSubmitting}
            error={error}
            nickname={nickname}
            onImageClick={(src, alt) => setLightboxImage({ src, alt })}
          />
        )}

        {step === "complete" && (
          <CompleteStep voteCount={voteCount} />
        )}
      </main>

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            onClick={() => setLightboxImage(null)}
            aria-label="閉じる"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={lightboxImage.src}
            alt={lightboxImage.alt}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

function NicknameStep({
  nickname,
  setNickname,
  onNext,
}: {
  nickname: string
  setNickname: (v: string) => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-6 pt-8 animate-slide-up">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">投票に参加しよう!</h2>
        <p className="text-muted-foreground mt-2">
          まずニックネームを教えてください
        </p>
      </div>

      <div className="w-full max-w-xs">
        <Input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="ニックネームを入力"
          className="text-center text-lg h-12"
          maxLength={20}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing && nickname.trim()) {
              onNext()
            }
          }}
        />
      </div>

      <Button
        size="lg"
        className="px-8 text-base"
        disabled={!nickname.trim()}
        onClick={onNext}
      >
        投票に進む
      </Button>
    </div>
  )
}

function VoteStep({
  ideas,
  selectedIdea,
  setSelectedIdea,
  comment,
  setComment,
  onSubmit,
  isSubmitting,
  error,
  nickname,
  onImageClick,
}: {
  ideas: Idea[]
  selectedIdea: string | null
  setSelectedIdea: (id: string | null) => void
  comment: string
  setComment: (v: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  error: string | null
  nickname: string
  onImageClick?: (src: string, alt: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center mb-2 animate-slide-up">
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{nickname}</span>さん、
          <br />
          最も気に入ったアイデアを1つ選んでください
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {ideas.map((idea, index) => (
          <div
            key={idea.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: "backwards" }}
          >
            <Card
              className={`h-full transition-all duration-200 cursor-pointer ${
                selectedIdea === idea.id
                  ? "ring-2 ring-primary shadow-lg scale-[1.02]"
                  : "hover:shadow-md hover:scale-[1.01]"
              }`}
              onClick={() => setSelectedIdea(idea.id === selectedIdea ? null : idea.id)}
            >
              <CardContent className="py-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ${
                      selectedIdea === idea.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Vote className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-foreground break-words">{idea.title}</p>
                  </div>
                  {idea.url && (
                    <a
                      href={idea.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0 shadow-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      デモを体験
                    </a>
                  )}
                </div>
                {idea.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed"><LinkifyText>{idea.description}</LinkifyText></p>
                )}
                {idea.image_url && (
                  <img
                    src={idea.image_url}
                    alt={idea.title}
                    className="w-full rounded-lg border border-border/30 object-contain max-h-48 cursor-zoom-in hover:border-primary/50 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      onImageClick?.(idea.image_url!, idea.title)
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive text-center mt-2">{error}</p>
      )}

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm py-4 -mx-4 px-4 border-t mt-2 flex flex-col gap-3">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="このアイデアを選んだ理由（任意）"
          disabled={!selectedIdea}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          rows={2}
          maxLength={200}
        />
        <Button
          size="lg"
          className={`w-full text-base ${selectedIdea ? "animate-pulse-glow" : ""}`}
          disabled={!selectedIdea || isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? "投票中..." : "このアイデアに投票する!"}
        </Button>
      </div>
    </div>
  )
}

function CompleteStep({ voteCount }: { voteCount: number }) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 pt-12">
      <div className="animate-bounce-in">
        <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center">
          <PartyPopper className="h-12 w-12 text-success" />
        </div>
      </div>

      {showContent && (
        <div className="text-center animate-slide-up">
          <h2 className="text-2xl font-bold text-foreground">
            投票完了!
          </h2>
          <p className="text-muted-foreground mt-2">
            ありがとうございます!
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            現在 <span className="font-bold text-foreground">{voteCount}人</span> が投票済みです
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            結果発表をお楽しみに!
          </p>
        </div>
      )}
    </div>
  )
}
