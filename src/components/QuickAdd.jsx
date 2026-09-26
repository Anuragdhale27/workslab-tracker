// Quick add: log an expense or income in 5 seconds. Lands in that month's tracker (created if missing).
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { today, inr } from '@/lib/utils'

const QUICK = ['Groceries', 'Dining & food delivery', 'Fuel / Cab / Metro', 'Shopping', 'Medical', 'Entertainment & OTT', 'Family / gifts']

export default function QuickAdd({ categories, onAdd, floating = true }) {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ section: 'variable', category: 'Groceries', custom: '', detail: '', amount: '', date: today() })
  const [busy, setBusy] = useState(false)
  const cats = f.section === 'income' ? (categories?.income || ['In-hand salary', 'Freelance / side income', 'Bonus', 'Cashback / refund']) : f.section === 'fixed' ? (categories?.fixed || []) : Array.from(new Set([...(categories?.variable || []), ...QUICK]))
  const set = (k, v) => setF(s => ({ ...s, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    const category = f.category === '__custom' ? f.custom.trim() : f.category
    if (!category || !f.amount) return
    setBusy(true)
    try { await onAdd({ section: f.section, category, detail: f.detail.trim(), amount: String(parseFloat(f.amount)), date: f.date }); setOpen(false); setF(s => ({ ...s, detail: '', amount: '', custom: '' })) }
    finally { setBusy(false) }
  }

  return (
    <>
      {floating
        ? <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-40 h-14 w-14 sm:w-auto sm:px-5 bg-accent text-accent-ink flex items-center justify-center gap-2 shadow-lg hover:bg-ink hover:text-paper transition-colors" title="Quick add"><Plus size={22} /><span className="hidden sm:inline font-medium text-sm">Quick add</span></button>
        : <Button size="sm" onClick={() => setOpen(true)}><Plus size={14} /> Quick add</Button>}
      {open && (
        <div className="fixed inset-0 z-50 bg-ink/60 grid place-items-end sm:place-items-center p-0 sm:p-4" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={e => e.stopPropagation()} className="bg-paper border border-ink w-full sm:max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-lg font-medium">Quick add</h2><button type="button" onClick={() => setOpen(false)}><X size={18} /></button></div>
            <div className="grid grid-cols-3 gap-px bg-ink border border-ink text-sm">
              {[['variable', 'Expense'], ['fixed', 'Fixed / EMI'], ['income', 'Income']].map(([k, l]) => (
                <button type="button" key={k} onClick={() => set('section', k) || set('category', k === 'income' ? 'In-hand salary' : k === 'fixed' ? (categories?.fixed?.[0] || '__custom') : 'Groceries')} className={`py-2 ${f.section === k ? 'bg-ink text-paper' : 'bg-paper hover:bg-paper-2'}`}>{l}</button>
              ))}
            </div>
            <label className="block text-sm"><span className="text-muted text-xs">Category</span>
              <select value={f.category} onChange={e => set('category', e.target.value)} className="w-full h-10 px-2 border border-line bg-paper text-sm mt-1">
                {cats.map(c => <option key={c}>{c}</option>)}<option value="__custom">＋ Other…</option>
              </select></label>
            {f.category === '__custom' && <Input placeholder="Category name" value={f.custom} onChange={e => set('custom', e.target.value)} autoFocus />}
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm"><span className="text-muted text-xs">Amount (₹)</span><Input type="number" inputMode="decimal" placeholder="1240" value={f.amount} onChange={e => set('amount', e.target.value)} className="mt-1" autoFocus /></label>
              <label className="block text-sm"><span className="text-muted text-xs">Date</span><Input type="date" value={f.date} onChange={e => set('date', e.target.value)} className="mt-1" /></label>
            </div>
            <label className="block text-sm"><span className="text-muted text-xs">Details (optional)</span><Input placeholder="e.g. DMart — vegetables, atta, milk" value={f.detail} onChange={e => set('detail', e.target.value)} className="mt-1" /></label>
            <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Adding…' : `Add ${f.amount ? inr(f.amount) : ''} to ${new Date(f.date).toLocaleString('en-IN', { month: 'long' })}`}</Button>
            <p className="text-xs text-muted">If that month's tracker doesn't exist yet, it will be created automatically.</p>
          </form>
        </div>
      )}
    </>
  )
}
