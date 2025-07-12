import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  showText?: boolean
}

export function LoadingSpinner({ size = "md", text = "ATHLOS 25", showText = true }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${sizeClasses[size]} border-2 border-primary/20 rounded-full`}></div>
        </div>
      </div>
      {showText && (
        <div className="text-center">
          <p className="text-lg font-display font-bold text-foreground">{text}</p>
          <p className="text-sm text-muted-foreground">Loading certificates...</p>
        </div>
      )}
    </div>
  )
} 