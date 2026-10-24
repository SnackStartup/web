import { WalletIcon } from 'lucide-react'
import { useApiWalletQuery } from '#/api/wallet/use-api-wallet-query'
import { getAccessToken } from '#/lib/auth-token'
import { cn } from '#/lib/utils'

const getPointsLabel = (n: number) => {
  if (n === 1) return 'punkt'
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14))
    return 'punkty'
  return 'punktów'
}

export const WalletInvite: React.FC = () => {
  const isAuthed = Boolean(getAccessToken())
  const walletQuery = useApiWalletQuery({ enabled: isAuthed })
  const wallet = walletQuery.data

  if (!isAuthed || !wallet?.save_url) return null

  return (
    <div className="mt-5 flex flex-col items-center gap-3">
      <p className="text-sm font-semibold text-primary-foreground">
        +{wallet.reward_points} {getPointsLabel(wallet.reward_points)} Stolik
      </p>
      <a
        href={wallet.save_url}
        target="_blank"
        rel="noopener"
        className={cn(
          'inline-flex h-14 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold shadow-md transition active:scale-[0.98]',
          'bg-neutral-900 text-white ring-1 ring-white/10',
          'dark:bg-white dark:text-neutral-900 dark:ring-black/10',
        )}
      >
        <WalletIcon className="size-5" />
        <div className="flex flex-col">
          Dodaj Stolik do Portfela Google
          <span className="text-xs font-normal text-neutral-400">
            Zbieraj punkty przy każdej kolejnej kawie.
          </span>
        </div>
      </a>
    </div>
  )
}
