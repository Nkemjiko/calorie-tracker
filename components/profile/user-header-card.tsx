import { Timer } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type UserHeaderCardProps = {
  name: string
  email: string
  avatarSrc: string
  statusLabel: string
}

export function UserHeaderCard({ name, email, avatarSrc, statusLabel }: UserHeaderCardProps) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center">
      <Avatar className="size-20 after:border-2">
        <AvatarImage src={avatarSrc || "/placeholder.svg"} alt={`${name}'s profile photo`} />
        <AvatarFallback className="text-lg font-semibold">
          {name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">{name}</h2>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold text-brand-green">
        <Timer className="size-3.5" />
        {statusLabel}
      </span>
    </section>
  )
}
