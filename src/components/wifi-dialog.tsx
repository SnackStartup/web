import { useRef } from 'react'
import { Button } from '#/components/ui/button'
import { useToast } from '#/components/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

type WifiField = 'ssid' | 'password'

export type WifiDialogProps = {
  open: boolean
  ssid: string
  password: string
  // Admin preview of a draft place: the page is inert, so copying is too.
  disabled?: boolean
  onOpenChange: (open: boolean) => void
  onCopy: () => void
}

export const WifiDialog: React.FC<WifiDialogProps> = ({
  open,
  ssid,
  password,
  disabled = false,
  onOpenChange,
  onCopy,
}) => {
  const toastManager = useToast()
  const ssidInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  const copy = async (field: WifiField, value: string) => {
    onCopy()
    try {
      await navigator.clipboard.writeText(value)
      // The button keeps its label; the toast at the top confirms the copy.
      toastManager.add({
        title: field === 'ssid' ? 'Skopiowano nazwę sieci' : 'Skopiowano hasło',
      })
    } catch {
      // No clipboard API (plain http) or a denied permission: let the guest
      // select the value by hand instead.
      const input =
        field === 'ssid' ? ssidInputRef.current : passwordInputRef.current
      input?.select()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>WiFi</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="wifi-ssid" className="text-muted-foreground">
              Sieć
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="wifi-ssid"
                ref={ssidInputRef}
                readOnly
                value={ssid}
                className="min-w-0 flex-1"
              />
              <Button
                variant="outline"
                disabled={disabled}
                onClick={() => void copy('ssid', ssid)}
              >
                Kopiuj
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="wifi-password" className="text-muted-foreground">
              Hasło
            </Label>
            {password ? (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id="wifi-password"
                  ref={passwordInputRef}
                  readOnly
                  value={password}
                  className="min-w-0 flex-1 font-mono tracking-[0.2em]"
                />
                <Button
                  variant="outline"
                  disabled={disabled}
                  onClick={() => void copy('password', password)}
                >
                  Kopiuj
                </Button>
              </div>
            ) : (
              <p className="text-sm">Bez hasła (sieć otwarta)</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
