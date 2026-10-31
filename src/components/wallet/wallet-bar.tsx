import { useApiWalletQuery } from '#/api/wallet/use-api-wallet-query'
import { getAccessToken } from '#/stores/auth-token'
import { cn } from '#/lib/utils'
import { CoffeeIcon, WalletIcon } from 'lucide-react'

export const WalletBar: React.FC = () => {
  const isAuthed = Boolean(getAccessToken())
  const apiWalletQuery = useApiWalletQuery({ enabled: isAuthed })
  const wallet = apiWalletQuery.data

  if (!wallet || !wallet.save_url) {
    return null
  }

  const isFull = wallet.points_balance >= wallet.redeem_cost

  return (
    <a
      href={wallet.save_url}
      target="_blank"
      rel="noopener"
      className={cn(
        // w-2/3 reads as a phone width; on desktop it stops at max-w-md (448px).
        'fixed bottom-4 left-1/2 z-40 flex flex-row -translate-x-1/2 w-2/3 max-w-md items-center gap-2',
        'rounded-full px-5 py-3 shadow-2xl transition active:scale-95',
        // odwrotność motywu: jasny lokal -> ciemny pasek
        'bg-neutral-900 text-white ring-1 ring-white/10',
        // ciemny lokal -> jasny pasek
        'dark:bg-white dark:text-neutral-900 dark:ring-black/10',
        isFull && 'shadow-[0_0_26px_-2px_var(--primary)]',
      )}
    >
      <CoffeeIcon className="size-5" />
      <div className="flex-1 flex flex-row items-center justify-center gap-1">
        <span className="text-sm font-bold tabular-nums">
          {wallet.points_balance}/{wallet.redeem_cost}
        </span>
        <span className="text-xs font-medium opacity-80">
          {isFull ? 'nagroda czeka!' : 'punktów Stolik'}
        </span>
      </div>
      <WalletIcon className="size-5 opacity-70" />
    </a>
  )
}
