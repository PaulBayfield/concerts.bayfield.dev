import { AlertTriangle } from "lucide-react"
import { cn } from "@/utils/utils"

interface ErrorBaseProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function ErrorBase({
  icon,
  title,
  subtitle,
  description,
  action,
  className,
}: ErrorBaseProps) {
  return (
    <div className={cn("flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center", className)}>
      <div className="space-y-6 max-w-md">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          {icon || <AlertTriangle className="h-12 w-12 text-primary animate-pulse" />}
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <h2 className="text-2xl font-semibold tracking-tight text-foreground/80">
              {subtitle}
            </h2>
          )}
          <p className="text-muted-foreground">
            {description}
          </p>
        </div>

        {action && (
          <div className="pt-4">
            {action}
          </div>
        )}
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] opacity-40 pointer-events-none"></div>
    </div>
  )
}
