import { cn } from '@/lib/utils'
export const Card = ({ className, ...p }) => <div className={cn('border border-ink bg-paper', className)} {...p} />
export const CardHeader = ({ className, ...p }) => <div className={cn('p-5 border-b border-ink flex items-center justify-between gap-3', className)} {...p} />
export const CardTitle = ({ className, ...p }) => <h3 className={cn('font-medium text-base', className)} {...p} />
export const CardContent = ({ className, ...p }) => <div className={cn('p-5', className)} {...p} />
