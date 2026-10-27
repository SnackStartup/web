import { Toast as ToastPrimitive } from '@base-ui/react/toast'
import { CircleCheck } from 'lucide-react'

import { cn } from '#/lib/utils.ts'

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toast) => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      data-slot="toast"
      className={cn(
        'pointer-events-auto flex w-full items-center gap-2 rounded-md bg-popover px-3 py-2 text-sm font-medium text-popover-foreground shadow-lg ring-1 ring-foreground/10',
        'transition-all duration-200 ease-out data-starting-style:-translate-y-3 data-starting-style:opacity-0 data-ending-style:-translate-y-3 data-ending-style:opacity-0 data-limited:hidden',
      )}
    >
      <CircleCheck className="size-4 shrink-0 text-green-600 dark:text-green-400" />
      <ToastPrimitive.Title />
    </ToastPrimitive.Root>
  ))
}

// The toast manager is context, so it has to wrap the app: anything that raises
// a toast must sit inside it. <Toaster /> draws the visible bar.
function ToastProvider({
  timeout = 2500,
  ...props
}: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider timeout={timeout} {...props} />
}

function Toaster() {
  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport
        data-slot="toast-viewport"
        className="pointer-events-none fixed inset-x-4 top-4 z-[100] mx-auto flex max-w-sm flex-col items-center gap-2"
      >
        <ToastList />
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  )
}

const useToast = ToastPrimitive.useToastManager

export { Toaster, ToastProvider, useToast }
