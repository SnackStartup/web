import { cn } from '#/lib/utils'
import { FaPhone, FaEnvelope } from 'react-icons/fa6'

type Props = {
  className?: string
}

export const Footer: React.FC<Props> = ({ className }) => {
  const year = new Date().getFullYear()

  return (
    <footer
      className={cn(
        'flex flex-col items-center justify-center gap-2 border-t border-border p-4 text-center',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <img src="/icon-2.png" className="size-6" alt="Kadr logo" />
        <span className="font-bold text-primary">Kadr</span>
      </div>
      <p className="max-w-sm text-xs text-neutral-500">
        Jesteśmy aplikacją, która pomaga restauracjom i gościom dzielić się
        zdjęciami dań w mediach społecznościowych.
      </p>

      {/* Contact */}
      <div className="flex flex-col items-center gap-1.5 text-xs text-neutral-500 sm:flex-row sm:gap-4">
        <a
          href="tel:+48123456789"
          className="flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <FaPhone className="size-3" />
          +48 123 456 789
        </a>
        <a
          href="mailto:kontakt@kadr.app"
          className="flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <FaEnvelope className="size-3" />
          kontakt@kadr.app
        </a>
      </div>

      <p className="text-xs text-neutral-400">© {year} Kadr</p>
    </footer>
  )
}
