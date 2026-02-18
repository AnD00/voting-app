"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import confetti from "canvas-confetti"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Users, ChevronDown, ChevronUp, ExternalLink, Crown } from "lucide-react"

interface Session {
  id: string
  title: string
  description: string | null
}

interface RankedIdea {
  id: string
  title: string
  description: string | null
  url: string | null
  image_url: string | null
  voteCount: number
}

export function ResultsView({
  session,
  ideas,
  totalVotes,
}: {
  session: Session
  ideas: RankedIdea[]
  totalVotes: number
}) {
  const [showOthers, setShowOthers] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const confettiFired = useRef(false)

  // Compute ranks with ties (e.g., 1, 2, 2, 4)
  const ranks = useMemo(() => {
    const result: number[] = []
    for (let i = 0; i < ideas.length; i++) {
      if (i === 0) {
        result.push(1)
      } else if (ideas[i].voteCount === ideas[i - 1].voteCount) {
        result.push(result[i - 1])
      } else {
        result.push(i + 1)
      }
    }
    return result
  }, [ideas])

  // Find all ideas tied for 1st place
  const winnerCount = ranks.filter((r) => r === 1).length
  const winners = ideas.slice(0, winnerCount)
  const others = ideas.slice(winnerCount)
  const otherRanks = ranks.slice(winnerCount)

  useEffect(() => {
    // Reveal animation after a short delay
    const timer = setTimeout(() => setRevealed(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (revealed && !confettiFired.current && winners.length > 0) {
      confettiFired.current = true
      // Fire confetti
      const duration = 3000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ["#e87040", "#f5a623", "#f7d060", "#7ed6a0", "#5bc0eb"],
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ["#e87040", "#f5a623", "#f7d060", "#7ed6a0", "#5bc0eb"],
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
    }
  }, [revealed, winners])

  if (winners.length === 0) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">{session.title}</h1>
          <p className="text-muted-foreground mt-2">アイデアがまだ登録されていません</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-lg mx-auto px-4 py-3 text-center">
          <h1 className="font-bold text-foreground text-lg">{session.title}</h1>
          <div className="flex items-center justify-center gap-1 mt-1 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>全 {totalVotes} 票</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Winner Section */}
        <div className={`transition-all duration-700 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium">
              <Crown className="h-4 w-4 text-primary" />
              結果発表
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {winners.map((winner) => (
              <Card key={winner.id} className="border-2 border-primary/30 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-bounce-in">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Trophy className="h-10 w-10 text-primary" />
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-medium text-primary mb-1">優勝</p>
                      <h2 className="text-2xl font-bold text-foreground text-balance">
                        {winner.title}
                      </h2>
                      {winner.description && (
                        <p className="text-sm text-muted-foreground mt-1">{winner.description}</p>
                      )}
                      {winner.image_url && (
                        <img
                          src={winner.image_url}
                          alt={winner.title}
                          className="w-full max-h-56 rounded-lg border border-border/30 object-contain mt-3"
                        />
                      )}
                      <p className="text-lg font-semibold text-primary mt-2">
                        {winner.voteCount} 票
                      </p>
                      {winner.url && (
                        <a
                          href={winner.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          詳しく見る
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Other Rankings */}
        {others.length > 0 && revealed && (
          <div className="mt-8 animate-slide-up" style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setShowOthers(!showOthers)}
            >
              {showOthers ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  他の順位を閉じる
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  他の順位を確認する
                </>
              )}
            </Button>

            {showOthers && (
              <div className="flex flex-col gap-2 mt-3">
                {others.map((idea, index) => (
                  <Card
                    key={idea.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
                  >
                    <CardContent className="py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                        {otherRanks[index]}
                      </div>
                      {idea.image_url && (
                        <img
                          src={idea.image_url}
                          alt={idea.title}
                          className="w-12 h-12 rounded-md object-cover shrink-0 border border-border/30"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {idea.title}
                        </p>
                        {idea.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{idea.description}</p>
                        )}
                        {idea.url && (
                          <a
                            href={idea.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            リンク
                          </a>
                        )}
                      </div>
                      <span className="text-sm font-medium text-muted-foreground shrink-0">
                        {idea.voteCount} 票
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
