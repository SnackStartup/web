import { Fragment } from 'react'

export const HighlightedText: React.FC<{ text: string; neon?: boolean }> = ({
  text,
  neon,
}) => {
  const parts = text.trim().replace(/\s+/g, ' ').split('*')
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span
        key={i}
        className={neon ? undefined : 'text-primary'}
        style={
          neon
            ? { animation: 'neon-text-pulse 2.5s ease-in-out infinite' }
            : undefined
        }
      >
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}
