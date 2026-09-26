import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...i) => twMerge(clsx(i))
export const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0)
export const num = (v) => { const n = parseFloat(String(v ?? '').replace(/[^\d.-]/g, '')); return isNaN(n) ? 0 : n }
export const sum = (rows, key) => rows.reduce((a, r) => a + num(r[key]), 0)
export const uid = () => Math.random().toString(36).slice(2, 9)
export const monthLabel = (d = new Date()) => d.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
export const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`   // 2026-10
export const prevMonthKey = (k) => { const [y, m] = k.split('-').map(Number); const d = new Date(y, m - 2, 1); return monthKey(d) }
export const today = () => new Date().toISOString().slice(0, 10)
export const pct = (a, b) => b ? Math.min(999, Math.round(a / b * 100)) : 0

// Read a theme colour for charts (CSS var → rgb string)
export const themeColor = (name, alpha = 1) => `rgb(${getComputedStyle(document.documentElement).getPropertyValue(name).trim()} / ${alpha})`
