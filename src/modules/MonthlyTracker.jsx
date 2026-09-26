import { useMemo } from 'react'
import ModuleShell from '@/components/ModuleShell'
import Grid from '@/components/Grid'
import { ExpensePie, IncomeVsSpend } from '@/components/Charts'
import { useSheetSync } from '@/components/useSheetSync'
import { MODULE_TYPES, toRows } from '@/data/templates'
import { analyse } from '@/lib/insights'
import { inr, num, sum } from '@/lib/utils'
import { downloadCSV } from '@/lib/csv'

const tone = { good: 'border-ok text-ok', warn: 'border-accent text-accent', bad: 'border-bad text-bad', info: 'border-ink text-ink' }

export default function MonthlyTracker({ mod, spreadsheetId, onBack, setErr }) {
  const { data, update, status } = useSheetSync({ mod, kind: 'monthly', spreadsheetId, seed: MODULE_TYPES.monthly.seed, setErr })
  const income = sum(data.income, 'amount'), fixed = sum(data.fixed, 'amount'), variable = sum(data.variable, 'amount')
  const saved = income - fixed - variable
  const insights = useMemo(() => analyse(data), [data])
  const pie = [...data.fixed, ...data.variable].map(r => ({ name: r.category, value: num(r.amount) }))

  const text = { key: 'category', label: 'Category', type: 'text', placeholder: 'Category' }
  const amt = { key: 'amount', label: 'Amount (₹)', type: 'num', width: 140 }

  return (
    <ModuleShell mod={mod} spreadsheetId={spreadsheetId} onBack={onBack} status={status} onExport={() => downloadCSV(`${mod.name}.csv`, toRows('monthly', data))}>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink border border-ink">
        {[['In-hand income', income], ['Fixed outgo', fixed], ['Variable spend', variable], ['Saved', saved]].map(([l, v], i) => (
          <div key={l} className="bg-white p-4"><p className="text-xs text-neutral-500">{l}</p><p className={`text-xl sm:text-2xl font-medium tabular-nums tracking-tight ${i === 3 ? (v < 0 ? 'text-bad' : 'text-ok') : ''}`}>{inr(v)}</p>
            {i === 3 && income > 0 && <p className="text-xs text-neutral-500">{Math.round(saved / income * 100)}% of income</p>}</div>
        ))}
      </div>

      {/* Insights */}
      <div className="grid md:grid-cols-2 gap-3">
        {insights.map((x, i) => <div key={i} className={`border-l-2 pl-3 py-1 text-sm ${tone[x.tone]}`}>{x.text}</div>)}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="border border-ink p-4"><p className="text-sm font-medium mb-2">Expenses breakdown</p><ExpensePie data={pie} /></div>
        <div className="border border-ink p-4"><p className="text-sm font-medium mb-2">Income vs spend</p><IncomeVsSpend income={income} fixed={fixed} variable={variable} /></div>
      </div>

      {/* Grids */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Grid title="Monthly income" rows={data.income} columns={[text, amt]} totals onChange={r => update({ ...data, income: r })} newRow={() => ({ category: '', amount: '' })} />
        <Grid title="Fixed expenses" rows={data.fixed} columns={[text, amt]} totals onChange={r => update({ ...data, fixed: r })} newRow={() => ({ category: '', amount: '' })} />
      </div>
      <Grid title="Variable expenses" rows={data.variable} totals onChange={r => update({ ...data, variable: r })} newRow={() => ({ category: '', amount: '', budget: '' })}
        columns={[text, { key: 'budget', label: 'Budget (₹)', type: 'num', width: 130 }, { ...amt, label: 'Spent (₹)', width: 130 },
          { key: 'var', label: 'Variance', type: 'num', width: 130, computed: r => num(r.budget) ? inr(num(r.budget) - num(r.amount)) : '—', className: r => num(r.amount) > num(r.budget) && num(r.budget) ? 'text-bad' : 'text-ok',
            total: rows => inr(sum(rows, 'budget') - sum(rows, 'amount')), totalClass: rows => sum(rows, 'amount') > sum(rows, 'budget') ? 'text-bad' : 'text-ok' }]} />
    </ModuleShell>
  )
}
