import { cn } from '@/lib/utils'
export const Input = ({ className, ...p }) => (
  <input className={cn('w-full h-10 px-3 border border-neutral-300 bg-white text-sm focus:border-ink focus:outline-none placeholder:text-neutral-400 disabled:bg-paper-2', className)} {...p} />
)
