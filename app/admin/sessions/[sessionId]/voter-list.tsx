"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

interface VoteWithIdea {
  id: string
  voter_nickname: string
  voter_id: string
  created_at: string
  ideas: {
    title: string
  }
}

export function VoterList({ votes }: { votes: VoteWithIdea[] }) {
  // Group by voter_id to show unique voters
  const voterMap = new Map<string, { nickname: string; ideas: string[]; votedAt: string }>()

  for (const vote of votes) {
    const existing = voterMap.get(vote.voter_id)
    if (existing) {
      existing.ideas.push(vote.ideas.title)
    } else {
      voterMap.set(vote.voter_id, {
        nickname: vote.voter_nickname,
        ideas: [vote.ideas.title],
        votedAt: vote.created_at,
      })
    }
  }

  const voters = Array.from(voterMap.values()).sort(
    (a, b) => new Date(a.votedAt).getTime() - new Date(b.votedAt).getTime()
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          投票者一覧 ({voters.length}人)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {voters.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            まだ投票がありません
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {voters.map((voter, i) => (
              <div key={i} className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
                <p className="font-medium text-foreground">{voter.nickname}</p>
                <div className="flex flex-wrap gap-1">
                  {voter.ideas.map((idea, j) => (
                    <span
                      key={j}
                      className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                    >
                      {idea}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
