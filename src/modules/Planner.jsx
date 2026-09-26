// Reusable planner: Wedding, Trip (and any future estimated-vs-actual module)
import ModuleShell from '@/components/ModuleShell'
import Grid from '@/components/Grid'
import { EstVsActual, Ring } from '@/components/Charts'
import { useSheetSync } from '@/components/useSheetSync'
import { MODULE_TYPES, toRows } from '@/data/templates'
import { inr, num, sum } from '@/lib/utils'
import { downloadCSV } from '@/lib/csv'

export default function Planner({ mod, spreadsheetId, onBack, setErr, onArchive }) {
  const t = MODULE_TYPES[mod.type]
  const { data, update, status } = useSheetSync({ mod, kind: 'planner', spreadsheetId, seed: t.seed, setErr })
  const est = sum(data, 'estimated'), act = sum(data, 'actual'), variance = est - act
  // Trip gamification: location photo header (free, keyless). Falls back to dark header if image fails.
  const hero = t.hero && mod.meta?.destination ? `https://loremflickr.com/1200/400/${encodeURIComponent(mod.meta.destination)},travel` : null

  return (
    <ModuleShell mod={mod} spreadsheetId={spreadsheetId} onBack={onBack} status={status} hero={hero} onArchive={onArchive} onExport={() => downloadCSV(`${mod.name}.csv`, toRows('planner', data))}>
      <div className="grid grid-cols-3 gap-px bg-ink border border-ink">
        <K label="Estimated budget" v={est} /><K label="Actual cost" v={act} />
        <div className="bg-paper p-4"><p className="text-xs text-muted">Variance</p><p className={`text-xl sm:text-2xl font-medium tabular-nums tracking-tight ${variance < 0 ? 'text-bad' : 'text-ok'}`}>{variance < 0 ? '−' : ''}{inr(Math.abs(variance))}</p><p className="text-xs text-muted">{variance < 0 ? 'Over budget' : 'Under budget'}</p></div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4"><div className="border border-ink bg-paper p-4 flex flex-col gap-4"><p className="text-sm font-medium">Budget used</p><Ring value={est ? act / est * 100 : 0} label={act > est ? 'Over budget' : 'Of estimate spent'} sub={`${data.filter(r => r.actual).length} of ${data.length} items paid`} /></div>
      <div className="lg:col-span-2 border border-ink bg-paper p-4"><p className="text-sm font-medium mb-2">Estimated vs actual</p><EstVsActual rows={data.map(r => ({ ...r, estimated: num(r.estimated), actual: num(r.actual) }))} /></div></div>
      <Grid title="Line items" rows={data} totals onChange={update} newRow={() => ({ item: '', estimated: '', actual: '', note: '' })}
        columns={[{ key: 'item', label: 'Item', type: 'text', placeholder: 'Item' }, { key: 'estimated', label: 'Estimated (₹)', type: 'num', width: 140 }, { key: 'actual', label: 'Actual (₹)', type: 'num', width: 140 },
          { key: 'v', label: 'Variance', type: 'num', width: 130, computed: r => (r.estimated || r.actual) ? inr(num(r.estimated) - num(r.actual)) : '—', className: r => num(r.actual) > num(r.estimated) ? 'text-bad' : 'text-ok', total: rows => inr(sum(rows, 'estimated') - sum(rows, 'actual')), totalClass: rows => sum(rows, 'actual') > sum(rows, 'estimated') ? 'text-bad' : 'text-ok' },
          { key: 'note', label: 'Note', type: 'text', placeholder: '—', width: 160 }]} />
    </ModuleShell>
  )
}
const K = ({ label, v }) => <div className="bg-paper p-4"><p className="text-xs text-muted">{label}</p><p className="text-xl sm:text-2xl font-medium tabular-nums tracking-tight">{inr(v)}</p></div>
