"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

interface VoteWithIdea {
  id: string
  voter_nickname: string
  voter_id: string
  comment: string | null
  created_at: string
  ideas: {
    title: string
  }
}

export function VoterList({ votes }: { votes: VoteWithIdea[] }) {
  // Group by voter_id to show unique voters
  const voterMap = new Map<string, { nickname: string; idea: string; comment: string | null; votedAt: string }>()

  for (const vote of votes) {
    if (!voterMap.has(vote.voter_id)) {
      voterMap.set(vote.voter_id, {
        nickname: vote.voter_nickname,
        idea: vote.ideas.title,
        comment: vote.comment,
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
          <>
            {/* Desktop: テーブル */}
            <div className="hidden sm:block overflow-x-auto -mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-6 py-2 font-medium text-muted-foreground whitespace-nowrap">投票者</th>
                    <th className="px-6 py-2 font-medium text-muted-foreground whitespace-nowrap">投票先</th>
                    <th className="px-6 py-2 font-medium text-muted-foreground whitespace-nowrap">コメント</th>
                  </tr>
                </thead>
                <tbody>
                  {voters.map((voter, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-6 py-3 font-medium text-foreground whitespace-nowrap align-top">
                        {voter.nickname}
                      </td>
                      <td className="px-6 py-3 align-top">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
                          {voter.idea}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground whitespace-pre-wrap break-words align-top max-w-xs">
                        {voter.comment || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: カード */}
            <div className="flex flex-col gap-2 sm:hidden">
              {voters.map((voter, i) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{voter.nickname}</p>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                      {voter.idea}
                    </span>
                  </div>
                  {voter.comment && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {voter.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
