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
        ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300'
        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
    }`}
  >
    {message}
  </div>
)
