import { Link } from '@tanstack/react-router'
import { MenuIcon, XIcon, ArrowRightIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

const navLinks = [
  { label: 'Jak to działa', href: '#jak-to-dziala' },
  { label: 'Dla kogo', href: '#dla-kogo' },
  { label: 'Kontakt', href: '#kontakt' },
]

export const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/icon-96.png" alt="Stolik" className="size-8" />
          <span className="text-lg font-bold">Stolik</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <Button size="sm" render={<a href="#kontakt" />}>
            Skontaktuj się
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </nav>

        {/* Mobile menu button */}
        <button
          className="flex size-9 items-center justify-center rounded-md transition-colors hover:bg-muted md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Zamknij menu' : 'Otwórz menu'}
        >
          {mobileOpen ? (
            <XIcon className="size-5" />
          ) : (
            <MenuIcon className="size-5" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <Button
              className="mt-2"
              render={
                <a href="#kontakt" onClick={() => setMobileOpen(false)} />
              }
            >
              Skontaktuj się
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
