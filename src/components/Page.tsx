import { cn } from '#/lib/utils'
import type { PropsWithChildren } from 'react'

export type PageProps = PropsWithChildren<{ className?: string }>

export const Page: React.FC<PageProps> = ({ children, className }) => {
  return <div className={cn(className, 'p-8')}>{children}</div>
}
