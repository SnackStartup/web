import { cn } from '#/lib/utils'
import { Link } from '@tanstack/react-router'
import { FaPhone, FaEnvelope } from 'react-icons/fa6'

type Props = {
  className?: string
}

export const Footer: React.FC<Props> = ({ className }) => {
  const year = new Date().getFullYear()

  return (
    <footer
      className={cn(
        'flex flex-col items-center justify-center gap-3 border-t border-border p-4 text-center bg-neutral-50',
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <img src="/icon.png" className="size-6" alt="logo" />
        <span className="font-bold">Stolik</span>
      </div>
      <p className="max-w-sm text-xs text-neutral-500">
        Jesteśmy aplikacją, która pomaga restauracjom i gościom dzielić się
        zdjęciami dań w mediach społecznościowych.
      </p>

      {/* Contact */}
      <div className="flex flex-col items-center gap-1.5 text-xs text-neutral-500 sm:flex-row sm:gap-4">
        {/* <a
          href="tel:+48123456789"
          className="flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <FaPhone className="size-3" />
          +48 123 456 789
        </a>*/}
        <a
          href="mailto:stolikpic@gmail.com"
          className="flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <FaEnvelope className="size-3" />
          stolikpic@gmail.com
        </a>
      </div>

      <div className="flex gap-2 text-xs text-neutral-500">
        <Link
          to="/polityka-prywatnosci"
          className="hover:text-primary transition-colors underline"
        >
          Polityka prywatności
        </Link>
        <Link
          to="/regulamin"
          className="hover:text-primary transition-colors underline"
        >
          Regulamin
        </Link>
      </div>

      {/* <p className="text-xs text-neutral-400">© {year} Stolik</p>*/}
    </footer>
  )
}
