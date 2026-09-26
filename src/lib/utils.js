import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...i) => twMerge(clsx(i))

// Indian currency formatting: ₹1,23,456
export const inr = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0)

export const num = (v) => { const n = parseFloat(String(v).replace(/[^\d.-]/g, '')); return isNaN(n) ? 0 : n }
export const sum = (rows, key) => rows.reduce((a, r) => a + num(r[key]), 0)
export const uid = () => Math.random().toString(36).slice(2, 9)
export const monthLabel = (d = new Date()) => d.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
