import ModuleShell from '@/components/ModuleShell'
import Grid from '@/components/Grid'
import { useSheetSync } from '@/components/useSheetSync'
import { MODULE_TYPES, toRows } from '@/data/templates'
import { inr, num } from '@/lib/utils'
import { downloadCSV } from '@/lib/csv'

export default function Goals({ mod, spreadsheetId, onBack, setErr }) {
  const { data, update, status } = useSheetSync({ mod, kind: 'goals', spreadsheetId, seed: MODULE_TYPES.goals.seed, setErr })
  return (
    <ModuleShell mod={mod} spreadsheetId={spreadsheetId} onBack={onBack} status={status} onExport={() => downloadCSV(`${mod.name}.csv`, toRows('goals', data))}>
      <div className="grid md:grid-cols-2 gap-4">
        {data.filter(g => g.goal).map((g, i) => {
          const t = num(g.target), s = num(g.saved), pct = t ? Math.min(100, Math.round(s / t * 100)) : 0
          const days = g.deadline ? Math.ceil((new Date(g.deadline) - Date.now()) / 86400000) : null
          const monthly = days > 0 && t > s ? (t - s) / Math.max(1, days / 30) : 0
          return (
            <div key={i} className="border border-ink p-5 space-y-3">
              <div className="flex justify-between items-start gap-3"><h3 className="font-medium leading-tight">{g.goal}</h3><span className="text-2xl font-medium tabular-nums">{pct}%</span></div>
              <div className="h-2 bg-neutral-200"><div className={`h-full ${pct >= 100 ? 'bg-ok' : 'bg-accent'} transition-all`} style={{ width: `${pct}%` }} /></div>
              <div className="flex justify-between text-xs text-neutral-600"><span>{inr(s)} saved</span><span>of {inr(t)}</span></div>
              {days !== null && <p className="text-xs text-neutral-500">{days > 0 ? `${days} days left · save ~${inr(monthly)}/month to hit it` : pct >= 100 ? 'Goal reached 🎉' : 'Deadline passed'}</p>}
            </div>
          )
        })}
      </div>
      <Grid title="Goals" rows={data} onChange={update} newRow={() => ({ goal: '', target: '', saved: '', deadline: '' })}
        columns={[{ key: 'goal', label: 'Goal', type: 'text', placeholder: 'e.g. New bike' }, { key: 'target', label: 'Target (₹)', type: 'num', width: 140 }, { key: 'saved', label: 'Saved so far (₹)', type: 'num', width: 150 }, { key: 'deadline', label: 'Deadline', type: 'date', width: 160 }]} />
    </ModuleShell>
  )
}
