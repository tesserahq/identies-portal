import { User } from 'lucide-react'

export function AvatarPreloader() {
  return (
    <div
      className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full
        border-4 border-border bg-muted transition-colors duration-300">
      <div
        className="animate-shimmer absolute inset-0 bg-gradient-to-r from-muted via-accent to-muted"
      />

      <div className="relative z-10">
        <User size={48} className="animate-pulse text-muted-foreground" />
      </div>

      <div className="absolute bottom-4 flex space-x-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary delay-0" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary delay-150" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary delay-300" />
      </div>
    </div>
  )
}
