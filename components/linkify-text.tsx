"use client"

import { Fragment } from "react"
import { ExternalLink } from "lucide-react"

const URL_REGEX = /(https?:\/\/[^\s<>\"']+)/g

export function LinkifyText({ children }: { children: string }) {
  const parts = children.split(URL_REGEX)

  return (
    <>
      {parts.map((part, i) =>
        URL_REGEX.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="break-all text-primary underline underline-offset-2 hover:text-primary/80"
          >
            <span className="inline-flex items-baseline gap-0.5 whitespace-nowrap underline underline-offset-2"><ExternalLink className="inline-block h-3 w-3 self-center no-underline" />{part.slice(0, 10)}</span>{part.slice(10)}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  )
}
