import { Fragment } from 'react'

export const HighlightedText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.trim().replace(/\s+/g, ' ').split('*')
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="text-primary">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}
