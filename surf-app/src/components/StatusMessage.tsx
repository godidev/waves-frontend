interface StatusMessageProps {
  message: string
  variant?: 'info' | 'error'
}

export const StatusMessage = ({
  message,
  variant = 'info',
}: StatusMessageProps) => (
  <div
    className={`rounded-2xl border p-6 text-center text-sm ${
      variant === 'error'
        ? 'border-red-500/40 bg-red-500/10 text-red-200'
        : 'border-white/10 bg-ocean-800/60 text-ocean-100'
    }`}
  >
    {message}
  </div>
)
