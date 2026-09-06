import { cn } from '#/lib/utils'
import type { CSSProperties, PropsWithChildren } from 'react'

export type PageProps = PropsWithChildren<{
  className?: string
  style?: CSSProperties
}>

export const Page: React.FC<PageProps> = ({ children, className, style }) => {
  return (
    <div className={cn(className, 'p-6')} style={style}>
      {children}
    </div>
  )
}
