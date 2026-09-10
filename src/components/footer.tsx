import { cn } from '#/lib/utils'
import { Link } from '@tanstack/react-router'
import { FaEnvelope } from 'react-icons/fa6'

type Props = {
  className?: string
}

export const Footer: React.FC<Props> = ({ className }) => {
  return (
    <footer className={cn('border-t border-border bg-background', className)}>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {/* Mobile: centered stacked | Desktop: single row */}
        <div className="flex flex-col items-center gap-4 text-center lg:flex-row lg:justify-between lg:text-left">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/icon-96.png" className="size-5" alt="logo" />
            <span className="text-sm font-bold">Stolik</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-3 text-xs text-muted-foreground">
            <Link
              to="/privacy-policy"
              className="transition-colors hover:text-foreground"
            >
              Polityka prywatności
            </Link>
            <span className="text-border">·</span>
            <Link to="/tos" className="transition-colors hover:text-foreground">
              Regulamin
            </Link>
          </nav>

          {/* Contact */}
          <a
            href="mailto:stolikpic@gmail.com"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <FaEnvelope className="size-3" />
            stolikpic@gmail.com
          </a>
        </div>
      </div>
    </footer>
  )
}
