"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Vote, Lightbulb } from "lucide-react"

interface Session {
  id: string
  title: string
  description: string | null
  is_closed: boolean
  created_at: string
  ideas: { count: number }[]
  votes: { count: number }[]
}

export function SessionList({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        まだ投票がありません。上のフォームから作成しましょう。
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => (
        <Link key={session.id} href={`/admin/sessions/${session.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground break-words">{session.title}</h3>
                  <Badge variant={session.is_closed ? "secondary" : "default"} className="shrink-0">
                    {session.is_closed ? "締切済" : "投票中"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Lightbulb className="h-3.5 w-3.5" />
                    {session.ideas[0]?.count ?? 0} アイデア
                  </span>
                  <span className="flex items-center gap-1">
                    <Vote className="h-3.5 w-3.5" />
                    {session.votes[0]?.count ?? 0} 投票
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
