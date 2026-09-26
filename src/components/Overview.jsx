// Home analysis: summary boxes with rings/pies for every active tracker + finance suggestions
import { useMemo, useState } from 'react'
import { RefreshCw, ChevronDown } from 'lucide-react'
import { ExpensePie, Ring } from '@/components/Charts'
import { MODULE_TYPES } from '@/data/templates'
import { cacheGet } from '@/lib/storage'
import { inr, num, sum, monthKey } from '@/lib/utils'
import { analyse, suggestions } from '@/lib/insights'
import { Button } from '@/components/ui/button'

const tone = { good: 'border-ok', warn: 'border-accent', bad: 'border-bad', info: 'border-ink' }

export default function Overview({ modules, onOpen, onRefresh, refreshing }) {
  const [showSug, setShowSug] = useState(true)
  const active = modules.filter(m => !m.archived)
  const withData = active.map(m => ({ m, d: cacheGet(`mod:${m.id}`) })).filter(x => x.d)
  const monthlyMods = withData.filter(x => x.m.type === 'monthly').sort((a, b) => (b.m.meta?.month || '').localeCompare(a.m.meta?.month || ''))
  const cur = monthlyMods.find(x => x.m.meta?.month === monthKey()) || monthlyMods[0]
  const planners = withData.filter(x => MODULE_TYPES[x.m.type].kind === 'planner')
  const goals = withData.filter(x => x.m.type === 'goals')
  const sug = useMemo(() => suggestions({ monthly: cur?.d, goals: goals.map(g => g.d) }), [cur, goals])

  if (!active.length) return null
  const inc = cur ? sum(cur.d.income, 'amount') : 0, out = cur ? sum(cur.d.fixed, 'amount') + sum(cur.d.variable, 'amount') : 0

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted flex items-center gap-2"><span className="w-6 h-px bg-accent" /> Analysis</p>
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={refreshing}><RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Reading your Sheet…' : 'Refresh from Sheet'}</Button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-px bg-ink border border-ink">
        {/* Monthly box */}
        {cur && (
          <button onClick={() => onOpen(cur.m.id)} className="bg-paper p-5 text-left hover:bg-paper-2 transition-colors md:col-span-2 xl:col-span-2 grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted">Monthly · {cur.m.name}</p>
              <p className="text-2xl font-medium tracking-tight tabular-nums mt-1">{inr(inc - out)} <span className="text-sm font-light text-muted">saved</span></p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Ring value={inc ? (inc - out) / inc * 100 : 0} label="Savings rate" size={56} />
                <Ring value={inc ? out / inc * 100 : 0} label="Income used" size={56} />
              </div>
              <div className="mt-4 space-y-1">{analyse(cur.d).slice(0, 2).map((x, i) => <p key={i} className={`border-l-2 pl-2 text-xs ${tone[x.tone]}`}>{x.text}</p>)}</div>
            </div>
            <div><ExpensePie height={200} data={[...cur.d.fixed, ...cur.d.variable].map(r => ({ name: r.category, value: num(r.amount) }))} /></div>
          </button>
        )}
        {/* Planner boxes */}
        {planners.map(({ m, d }) => { const est = sum(d, 'estimated'), act = sum(d, 'actual'); return (
          <button key={m.id} onClick={() => onOpen(m.id)} className="bg-paper p-5 text-left hover:bg-paper-2 transition-colors">
            <p className="text-xs text-muted">{MODULE_TYPES[m.type].label} · {m.name}</p>
            <p className="text-2xl font-medium tracking-tight tabular-nums mt-1">{inr(act)} <span className="text-sm font-light text-muted">of {inr(est)}</span></p>
            <div className="mt-4"><Ring value={est ? act / est * 100 : 0} label="Budget used" sub={act > est ? `${inr(act - est)} over` : `${inr(est - act)} left`} /></div>
          </button>
        )})}
        {/* Goals boxes */}
        {goals.map(({ m, d }) => { const rows = d.filter(g => g.goal); const t = sum(rows, 'target'), s = rows.reduce((a, r) => a + Math.min(num(r.saved), num(r.target) || num(r.saved)), 0); const done = rows.filter(r => r.done).length; return (
          <button key={m.id} onClick={() => onOpen(m.id)} className="bg-paper p-5 text-left hover:bg-paper-2 transition-colors">
            <p className="text-xs text-muted">Goals · {m.name}</p>
            <p className="text-2xl font-medium tracking-tight tabular-nums mt-1">{done}/{rows.length} <span className="text-sm font-light text-muted">completed</span></p>
            <div className="mt-4"><Ring value={t ? s / t * 100 : 0} label="Overall progress" sub={`${inr(s)} of ${inr(t)}`} /></div>
          </button>
        )})}
        {active.length > withData.length && <div className="bg-paper p-5 text-sm text-muted font-light flex items-center">{active.length - withData.length} tracker(s) not loaded yet — tap "Refresh from Sheet".</div>}
      </div>

      {/* Suggestions */}
      <div className="border border-ink bg-paper">
        <button className="w-full flex justify-between items-center px-5 py-3 text-sm font-medium" onClick={() => setShowSug(s => !s)}>Money management suggestions <ChevronDown size={16} className={showSug ? 'rotate-180' : ''} /></button>
        {showSug && <div className="grid md:grid-cols-2 xl:grid-cols-3 border-t border-line">{sug.map(s => (
          <div key={s.title} className="p-4 border-b md:border-r border-line text-sm"><p className={`font-medium mb-1 flex items-center gap-2`}><span className={`w-2 h-2 ${s.ok ? 'bg-ok' : 'bg-accent'}`} />{s.title}</p><p className="text-muted font-light">{s.text}</p></div>
        ))}</div>}
        <p className="px-5 py-2 text-[11px] text-muted border-t border-line">General guidance, not personalised financial advice. Talk to a SEBI-registered adviser for your situation.</p>
      </div>
    </section>
  )
}
