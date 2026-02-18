import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Vote, Lightbulb, ArrowRight, Sparkles } from "lucide-react"

export default async function HomePage() {
  const supabase = createClient()
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*, ideas(count), votes(count)")
    .order("created_at", { ascending: false })

  const activeSessions = (sessions ?? []).filter((s) => !s.is_closed)
  const closedSessions = (sessions ?? []).filter((s) => s.is_closed)

  return (
    <div className="min-h-dvh bg-background">
      <header className="bg-card border-b">
        <div className="max-w-lg mx-auto px-4 py-6 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Idea Vote</h1>
          <p className="text-muted-foreground mt-1">チームのアイデアに投票しよう</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
        {activeSessions.length === 0 && closedSessions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>現在開催中の投票会はありません</p>
          </div>
        )}

        {activeSessions.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Vote className="h-5 w-5 text-primary" />
              投票受付中
            </h2>
            <div className="flex flex-col gap-3">
              {activeSessions.map((session) => (
                <Link key={session.id} href={`/vote/${session.id}`}>
                  <Card className="hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer border-primary/20">
                    <CardContent className="py-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{session.title}</h3>
                          <Badge className="shrink-0 bg-primary text-primary-foreground">投票中</Badge>
                        </div>
                        {session.description && (
                          <p className="text-sm text-muted-foreground truncate">{session.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Lightbulb className="h-3 w-3" />
                            {session.ideas[0]?.count ?? 0} アイデア
                          </span>
                          <span className="flex items-center gap-1">
                            <Vote className="h-3 w-3" />
                            {session.votes[0]?.count ?? 0} 投票
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-primary shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {closedSessions.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-muted-foreground" />
              結果発表済み
            </h2>
            <div className="flex flex-col gap-3">
              {closedSessions.map((session) => (
                <Link key={session.id} href={`/results/${session.id}`}>
                  <Card className="hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer">
                    <CardContent className="py-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{session.title}</h3>
                          <Badge variant="secondary" className="shrink-0">締切済</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Vote className="h-3 w-3" />
                            {session.votes[0]?.count ?? 0} 投票
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
