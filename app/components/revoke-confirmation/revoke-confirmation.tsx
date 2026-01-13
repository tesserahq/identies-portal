import { Button } from '@shadcn/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shadcn/ui/dialog'
import { Loader2, ShieldX } from 'lucide-react'
import { forwardRef, useImperativeHandle, useState } from 'react'

export interface RevokeConfirmationHandle {
  open: (config?: RevokeConfirmationConfig) => void
  close: () => void
  updateConfig: (updates: Partial<RevokeConfirmationConfig>) => void
}

export interface RevokeConfirmationConfig {
  title: string
  description: string
  onRevoke: () => void | Promise<void>
  isLoading?: boolean
}

interface RevokeConfirmationProps {
  defaultConfig?: RevokeConfirmationConfig
}

const RevokeConfirmation = forwardRef<RevokeConfirmationHandle, RevokeConfirmationProps>(
  ({ defaultConfig }, ref) => {
    const [open, setOpen] = useState(false)
    const [config, setConfig] = useState<RevokeConfirmationConfig>(
      defaultConfig || {
        title: '',
        description: '',
        onRevoke: () => {},
      }
    )

    useImperativeHandle(ref, () => ({
      open: (newConfig?: RevokeConfirmationConfig) => {
        if (newConfig) {
          setConfig(newConfig)
        }
        setOpen(true)
      },
      close: () => {
        setOpen(false)
      },
      updateConfig: (updates: Partial<RevokeConfirmationConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }))
      },
    }))

    const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen)
    }

    const handleRevoke = async () => {
      await config.onRevoke()
    }

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="border-t-destructive max-w-md border-t-4">
          <DialogHeader className="flex flex-col items-center">
            <div
              className="bg-destructive -mt-16 flex h-16 w-16 items-center justify-center
                rounded-full p-3">
              <ShieldX size={100} className="text-white" />
            </div>
            <DialogTitle className="hidden"></DialogTitle>
          </DialogHeader>
          <DialogDescription className="px-3" asChild>
            <div className="flex flex-col items-center">
              <h1
                className="dark:text-secondary-foreground text-center text-3xl font-semibold
                  text-black">
                {config.title}
              </h1>
              <p className="dark:text-secondary-foreground mt-3 text-center text-base text-black">
                {config.description}
              </p>
            </div>
          </DialogDescription>

          <DialogFooter className="mt-3">
            <div className="flex w-full justify-center gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </DialogClose>

              <Button
                variant="default"
                className="w-full bg-destructive hover:bg-warning/90"
                onClick={handleRevoke}
                disabled={config.isLoading}>
                {config.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Revoking...
                  </>
                ) : (
                  <>Confirm</>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
)

RevokeConfirmation.displayName = 'RevokeConfirmation'

export default RevokeConfirmation
