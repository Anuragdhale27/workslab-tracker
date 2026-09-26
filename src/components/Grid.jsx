// Editable grid. columns: [{key,label,type:'text'|'num'|'date',width}]
import { Plus, X } from 'lucide-react'
import { inr, num } from '@/lib/utils'

export default function Grid({ title, rows, columns, onChange, newRow, totals, extra }) {
  const set = (i, k, v) => onChange(rows.map((r, j) => j === i ? { ...r, [k]: v } : r))
  const del = (i) => onChange(rows.filter((_, j) => j !== i))
  return (
    <div className="border border-ink bg-paper">
      {title && <div className="px-4 py-3 border-b border-ink flex items-center justify-between"><h3 className="font-medium">{title}</h3>{extra}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead><tr className="text-xs text-muted border-b border-line">
            {columns.map(c => <th key={c.key} className={`px-2 py-2 font-normal ${c.type === 'text' ? 'text-left' : c.type === 'check' ? 'text-center' : 'text-right'}`} style={{ width: c.width }}>{c.label}</th>)}
            <th className="w-8" />
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-line group">
                {columns.map(c => (
                  <td key={c.key} className="p-0">
                    {c.computed ? <div className={`cell ${c.className?.(r) || ''}`}>{c.computed(r)}</div> :
                     c.type === 'check' ? <div className="h-9 grid place-items-center"><input type="checkbox" checked={!!r[c.key]} onChange={e => set(i, c.key, e.target.checked)} className="w-4 h-4 accent-[rgb(var(--c-accent))]" /></div> :
                      <input className={`cell ${c.type === 'text' ? 'cell-text' : ''}`} type={c.type === 'date' ? 'date' : c.type === 'num' ? 'number' : 'text'} inputMode={c.type === 'num' ? 'numeric' : undefined}
                        value={r[c.key] ?? ''} placeholder={c.type === 'num' ? '0' : c.placeholder || ''} onChange={e => set(i, c.key, e.target.value)} />}
                  </td>
                ))}
                <td className="p-0 text-center"><button onClick={() => del(i)} className="opacity-0 group-hover:opacity-100 text-muted hover:text-bad p-1" aria-label="Remove"><X size={14} /></button></td>
              </tr>
            ))}
          </tbody>
          {totals && <tfoot><tr className="border-t border-ink font-medium">
            {columns.map(c => <td key={c.key} className={`px-2 py-2 ${c.type === 'text' ? 'text-left' : 'text-right tabular-nums'} ${c.totalClass?.(rows) || ''}`}>{c.total ? c.total(rows) : c.type === 'num' ? inr(rows.reduce((a, r) => a + num(r[c.key]), 0)) : c.key === columns[0].key ? 'Total' : ''}</td>)}
            <td />
          </tr></tfoot>}
        </table>
      </div>
      {newRow && <button onClick={() => onChange([...rows, newRow()])} className="w-full text-left px-4 py-2.5 text-xs text-muted hover:text-ink hover:bg-paper-2 flex items-center gap-1 border-t border-line"><Plus size={12} /> Add row</button>}
    </div>
  )
}
