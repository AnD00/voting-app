"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Settings } from "lucide-react"
import Link from "next/link"

export function AdminHeader() {
  return (
    <header className="border-b bg-card">
      <div className="max-w-2xl mx-auto p-4 flex items-center justify-between">
        <Link href="/admin/sessions" className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">管理画面</span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            document.cookie = "admin_session=; path=/; max-age=0"
            window.location.href = "/admin"
          }}
        >
          <LogOut className="h-4 w-4 mr-1" />
          ログアウト
        </Button>
      </div>
    </header>
  )
}
