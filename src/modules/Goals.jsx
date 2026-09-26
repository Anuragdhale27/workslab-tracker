import ModuleShell from '@/components/ModuleShell'
import Grid from '@/components/Grid'
import { useSheetSync } from '@/components/useSheetSync'
import { MODULE_TYPES, toRows } from '@/data/templates'
import { inr, num } from '@/lib/utils'
import { downloadCSV } from '@/lib/csv'
import { CheckCircle2 } from 'lucide-react'

export default function Goals({ mod, spreadsheetId, onBack, setErr, onArchive }) {
  const { data, update, status } = useSheetSync({ mod, kind: 'goals', spreadsheetId, seed: MODULE_TYPES.goals.seed, setErr })
  const toggle = (i) => update(data.map((g, j) => j === i ? { ...g, done: !g.done, saved: !g.done && num(g.target) > num(g.saved) ? g.target : g.saved } : g))
  const live = data.map((g, i) => ({ ...g, i })).filter(g => g.goal)
  const done = live.filter(g => g.done)

  return (
    <ModuleShell mod={mod} spreadsheetId={spreadsheetId} onBack={onBack} status={status} onArchive={onArchive} onExport={() => downloadCSV(`${mod.name}.csv`, toRows('goals', data))}>
      {live.length > 0 && <p className="text-sm text-muted">{done.length} of {live.length} goals completed{done.length === live.length ? ' — all done! Archive this tracker or add a new goal.' : ''}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {live.map((g) => {
          const t = num(g.target), s = num(g.saved), pct = g.done ? 100 : t ? Math.min(100, Math.round(s / t * 100)) : 0
          const days = g.deadline ? Math.ceil((new Date(g.deadline) - Date.now()) / 86400000) : null
          const monthly = days > 0 && t > s ? (t - s) / Math.max(1, days / 30) : 0
          return (
            <div key={g.i} className={`border border-ink bg-paper p-5 space-y-3 ${g.done ? 'opacity-80' : ''}`}>
              <div className="flex justify-between items-start gap-3">
                <button onClick={() => toggle(g.i)} className="flex items-start gap-2 text-left" title={g.done ? 'Mark as not done' : 'Mark as completed'}>
                  <span className={`mt-0.5 w-5 h-5 border border-ink grid place-items-center shrink-0 ${g.done ? 'bg-ok border-ok text-white' : ''}`}>{g.done && <CheckCircle2 size={14} />}</span>
                  <h3 className={`font-medium leading-tight ${g.done ? 'line-through text-muted' : ''}`}>{g.goal}</h3>
                </button>
                <span className="text-2xl font-medium tabular-nums">{pct}%</span>
              </div>
              <div className="h-2 bg-line"><div className={`h-full ${pct >= 100 ? 'bg-ok' : 'bg-accent'} transition-all`} style={{ width: `${pct}%` }} /></div>
              <div className="flex justify-between text-xs text-muted"><span>{inr(s)} saved</span><span>of {inr(t)}</span></div>
              {g.done ? <p className="text-xs text-ok">Completed ✓</p> : days !== null && <p className="text-xs text-muted">{days > 0 ? `${days} days left · save ~${inr(monthly)}/month to hit it` : pct >= 100 ? 'Target reached — tick it off!' : 'Deadline passed'}</p>}
            </div>
          )
        })}
      </div>
      <Grid title="Goals" rows={data} onChange={update} newRow={() => ({ goal: '', target: '', saved: '', deadline: '', done: false })}
        columns={[{ key: 'goal', label: 'Goal', type: 'text', placeholder: 'e.g. New bike' }, { key: 'target', label: 'Target (₹)', type: 'num', width: 140 }, { key: 'saved', label: 'Saved so far (₹)', type: 'num', width: 150 }, { key: 'deadline', label: 'Deadline', type: 'date', width: 160 }, { key: 'done', label: 'Done', type: 'check', width: 60 }]} />
    </ModuleShell>
  )
}
