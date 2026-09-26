import { useMemo, useState } from 'react'
import { History, Download as Dl, X } from 'lucide-react'
import ModuleShell from '@/components/ModuleShell'
import Grid from '@/components/Grid'
import QuickAdd from '@/components/QuickAdd'
import { ExpensePie, IncomeVsSpend, Ring } from '@/components/Charts'
import { useSheetSync } from '@/components/useSheetSync'
import { MODULE_TYPES, toRows, applyTransaction, removeTransaction, carryForward } from '@/data/templates'
import { analyse } from '@/lib/insights'
import { inr, num, sum } from '@/lib/utils'
import { downloadCSV } from '@/lib/csv'
import { Button } from '@/components/ui/button'

const tone = { good: 'border-ok text-ok', warn: 'border-accent text-accent', bad: 'border-bad text-bad', info: 'border-ink text-ink' }

export default function MonthlyTracker({ mod, spreadsheetId, onBack, setErr, onArchive, loadPrev }) {
  const { data, update, status } = useSheetSync({ mod, kind: 'monthly', spreadsheetId, seed: MODULE_TYPES.monthly.seed, setErr })
  const [showHist, setShowHist] = useState(true)
  const income = sum(data.income, 'amount'), fixed = sum(data.fixed, 'amount'), variable = sum(data.variable, 'amount')
  const saved = income - fixed - variable
  const insights = useMemo(() => analyse(data), [data])
  const pie = [...data.fixed, ...data.variable].map(r => ({ name: r.category, value: num(r.amount) }))
  const history = [...(data.history || [])].map((h, i) => ({ ...h, i })).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  const emi = data.fixed.filter(r => /emi|loan/i.test(r.category)).reduce((a, r) => a + num(r.amount), 0)
  const cats = { income: data.income.map(r => r.category), fixed: data.fixed.map(r => r.category), variable: data.variable.map(r => r.category) }

  function loadLast() {
    const prev = loadPrev?.()
    if (!prev) return alert('No earlier month found on this device. Open last month\'s tracker once, then try again.')
    if (confirm('Load salary, fixed expenses and budgets from last month? Current entries will be replaced (history kept).')) update({ ...carryForward(prev), history: data.history || [] })
  }

  const text = { key: 'category', label: 'Category', type: 'text', placeholder: 'Category' }
  const amt = { key: 'amount', label: 'Amount (₹)', type: 'num', width: 140 }

  return (
    <ModuleShell mod={mod} spreadsheetId={spreadsheetId} onBack={onBack} status={status} onArchive={onArchive} onExport={() => downloadCSV(`${mod.name}.csv`, toRows('monthly', data))}
      actions={<><QuickAdd floating={false} categories={cats} onAdd={async t => update(applyTransaction(data, t))} /><Button variant="outline" size="sm" onClick={loadLast}><Dl size={14} /> Load last month</Button></>}>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink border border-ink">
        {[['In-hand income', income], ['Fixed outgo', fixed], ['Variable spend', variable], ['Saved', saved]].map(([l, v], i) => (
          <div key={l} className="bg-paper p-4"><p className="text-xs text-muted">{l}</p><p className={`text-xl sm:text-2xl font-medium tabular-nums tracking-tight ${i === 3 ? (v < 0 ? 'text-bad' : 'text-ok') : ''}`}>{inr(v)}</p>
            {i === 3 && income > 0 && <p className="text-xs text-muted">{Math.round(saved / income * 100)}% of income</p>}</div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">{insights.map((x, i) => <div key={i} className={`border-l-2 pl-3 py-1 text-sm ${tone[x.tone]}`}>{x.text}</div>)}</div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="border border-ink bg-paper p-4"><p className="text-sm font-medium mb-2">Expenses breakdown</p><ExpensePie data={pie} /></div>
        <div className="border border-ink bg-paper p-4"><p className="text-sm font-medium mb-2">Income vs spend</p><IncomeVsSpend income={income} fixed={fixed} variable={variable} /></div>
        <div className="border border-ink bg-paper p-4 flex flex-col gap-4"><p className="text-sm font-medium">At a glance</p>
          <Ring value={income ? saved / income * 100 : 0} label="Savings rate" sub="Target ≥ 20%" />
          <Ring value={income ? emi / income * 100 : 0} label="EMI load" sub="Keep under 40%" />
          <Ring value={income ? (fixed + variable) / income * 100 : 0} label="Income used" /></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Grid title="Monthly income" rows={data.income} columns={[text, amt]} totals onChange={r => update({ ...data, income: r })} newRow={() => ({ category: '', amount: '' })} />
        <Grid title="Fixed expenses" rows={data.fixed} columns={[text, amt]} totals onChange={r => update({ ...data, fixed: r })} newRow={() => ({ category: '', amount: '' })} />
      </div>
      <Grid title="Variable expenses" rows={data.variable} totals onChange={r => update({ ...data, variable: r })} newRow={() => ({ category: '', amount: '', budget: '' })}
        columns={[text, { key: 'budget', label: 'Budget (₹)', type: 'num', width: 130 }, { ...amt, label: 'Spent (₹)', width: 130 },
          { key: 'var', label: 'Variance', type: 'num', width: 130, computed: r => num(r.budget) ? inr(num(r.budget) - num(r.amount)) : '—', className: r => num(r.amount) > num(r.budget) && num(r.budget) ? 'text-bad' : 'text-ok',
            total: rows => inr(sum(rows, 'budget') - sum(rows, 'amount')), totalClass: rows => sum(rows, 'amount') > sum(rows, 'budget') ? 'text-bad' : 'text-ok' }]} />

      {/* History */}
      <div className="border border-ink bg-paper">
        <button className="w-full px-4 py-3 border-b border-ink flex items-center justify-between font-medium text-sm" onClick={() => setShowHist(s => !s)}><span className="flex items-center gap-2"><History size={16} /> History ({history.length})</span><span className="text-xs text-muted font-normal">Every quick-add, by date</span></button>
        {showHist && (history.length === 0 ? <p className="p-4 text-sm text-muted font-light">No entries yet. Use <b className="font-medium">Quick add</b> to log expenses as they happen — they appear here with date and details.</p> :
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[520px]"><thead><tr className="text-xs text-muted border-b border-line"><th className="text-left px-3 py-2 font-normal">Date</th><th className="text-left px-3 py-2 font-normal">Category</th><th className="text-left px-3 py-2 font-normal">Details</th><th className="text-right px-3 py-2 font-normal">Amount</th><th className="w-8" /></tr></thead>
            <tbody>{history.map(h => (
              <tr key={h.i} className="border-b border-line/60 group">
                <td className="px-3 py-2 tabular-nums text-muted">{h.date ? new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</td>
                <td className="px-3 py-2">{h.category}<span className="ml-2 text-[10px] text-muted uppercase">{h.section === 'income' ? 'in' : h.section === 'fixed' ? 'fixed' : ''}</span></td>
                <td className="px-3 py-2 text-muted font-light">{h.detail || '—'}</td>
                <td className={`px-3 py-2 text-right tabular-nums ${h.section === 'income' ? 'text-ok' : ''}`}>{h.section === 'income' ? '+' : '−'}{inr(h.amount)}</td>
                <td className="text-center"><button onClick={() => confirm('Remove this entry? The category total will be reduced.') && update(removeTransaction(data, h.i))} className="opacity-0 group-hover:opacity-100 text-muted hover:text-bad p-1"><X size={14} /></button></td>
              </tr>))}</tbody></table></div>)}
      </div>
    </ModuleShell>
  )
}
