"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { submitVote } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Vote, Users, PartyPopper, Sparkles } from "lucide-react"

interface Session {
  id: string
  title: string
  description: string | null
}

interface Idea {
  id: string
  title: string
  url: string | null
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
  const [nickname, setNickname] = useState("")
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voteCount, setVoteCount] = useState(totalVotes)

  // Shuffle ideas on mount
  const shuffledIdeas = useMemo(() => {
    return [...ideas].sort(() => Math.random() - 0.5)
  }, [ideas])

  // Check if already voted
  useEffect(() => {
    if (hasVoted(session.id)) {
      setStep("complete")
    } else {
      setStep("nickname")
    }
  }, [session.id])

  const handleSubmitVote = useCallback(async () => {
    if (!selectedIdea || !nickname.trim()) return
    setIsSubmitting(true)
    setError(null)

    const voterId = getVoterId()
    const result = await submitVote(session.id, selectedIdea, nickname.trim(), voterId)

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
  }, [selectedIdea, nickname, session.id])

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
          <h1 className="font-bold text-foreground text-lg text-balance">{session.title}</h1>
          {session.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{session.description}</p>
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
            onNext={() => setStep("vote")}
          />
        )}

        {step === "vote" && (
          <VoteStep
            ideas={shuffledIdeas}
            selectedIdea={selectedIdea}
            setSelectedIdea={setSelectedIdea}
            onSubmit={handleSubmitVote}
            isSubmitting={isSubmitting}
            error={error}
            nickname={nickname}
          />
        )}

        {step === "complete" && (
          <CompleteStep voteCount={voteCount} />
        )}
      </main>
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
            if (e.key === "Enter" && nickname.trim()) {
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
  onSubmit,
  isSubmitting,
  error,
  nickname,
}: {
  ideas: Idea[]
  selectedIdea: string | null
  setSelectedIdea: (id: string | null) => void
  onSubmit: () => void
  isSubmitting: boolean
  error: string | null
  nickname: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center mb-2 animate-slide-up">
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{nickname}</span>さん、
          気になるアイデアを1つ選んでください
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {ideas.map((idea, index) => (
          <button
            key={idea.id}
            onClick={() => setSelectedIdea(idea.id === selectedIdea ? null : idea.id)}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: "backwards" }}
          >
            <Card
              className={`transition-all duration-200 cursor-pointer ${
                selectedIdea === idea.id
                  ? "ring-2 ring-primary shadow-lg scale-[1.02]"
                  : "hover:shadow-md hover:scale-[1.01]"
              }`}
            >
              <CardContent className="py-4 flex items-center gap-3">
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
                  <p className="font-medium text-foreground">{idea.title}</p>
                  {idea.url && (
                    <a
                      href={idea.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      詳しく見る
                    </a>
                  )}
                </div>
                {selectedIdea === idea.id && (
                  <div className="animate-bounce-in shrink-0">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive text-center mt-2">{error}</p>
      )}

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm py-4 -mx-4 px-4 border-t mt-2">
        <Button
          size="lg"
          className="w-full text-base animate-pulse-glow"
          disabled={!selectedIdea || isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? "投票中..." : "この案に投票する!"}
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
