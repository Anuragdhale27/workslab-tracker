import { cn } from '@/lib/utils'
const variants = {
  default: 'bg-ink text-paper border-ink hover:bg-accent hover:border-accent',
  outline: 'bg-transparent text-ink border-ink hover:bg-ink hover:text-paper',
  ghost: 'border-transparent hover:bg-paper-2',
  danger: 'bg-transparent text-bad border-transparent hover:underline',
  accent: 'bg-accent text-paper border-accent hover:bg-ink hover:border-ink'
}
const sizes = { default: 'h-11 px-5 text-sm', sm: 'h-9 px-3 text-xs', lg: 'h-12 px-7 text-base', icon: 'h-9 w-9' }
export function Button({ className, variant = 'default', size = 'default', ...p }) {
  return <button className={cn('inline-flex items-center justify-center gap-2 border font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none', variants[variant], sizes[size], className)} {...p} />
}
