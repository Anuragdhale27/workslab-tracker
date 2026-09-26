import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { inr, themeColor } from '@/lib/utils'

const palette = () => [themeColor('--c-ink'), themeColor('--c-accent'), themeColor('--c-muted'), themeColor('--c-accent', .6), themeColor('--c-ink', .55), themeColor('--c-accent', .35), themeColor('--c-muted', .5), themeColor('--c-ink', .3)]
const tip = () => ({ border: `1px solid ${themeColor('--c-ink')}`, background: themeColor('--c-paper'), color: themeColor('--c-ink'), borderRadius: 0, fontSize: 12 })
const fmt = (v) => inr(v)
const short = (v) => v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v

export function ExpensePie({ data, height = 260 }) {
  const rows = data.filter(d => d.value > 0); const c = palette()
  if (!rows.length) return <Empty h={height} />
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={rows} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2} stroke={themeColor('--c-paper')}>
          {rows.map((_, i) => <Cell key={i} fill={c[i % c.length]} />)}
        </Pie>
        <Tooltip formatter={fmt} contentStyle={tip()} />
        <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function IncomeVsSpend({ income, fixed, variable }) {
  const data = [{ name: 'Income', value: income }, { name: 'Fixed', value: fixed }, { name: 'Variable', value: variable }, { name: 'Saved', value: Math.max(0, income - fixed - variable) }]
  if (!income && !fixed && !variable) return <Empty />
  const col = { Income: themeColor('--c-ink'), Fixed: themeColor('--c-accent'), Variable: themeColor('--c-accent', .6), Saved: themeColor('--c-ok') }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} stroke={themeColor('--c-line')} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: themeColor('--c-muted') }} axisLine={{ stroke: themeColor('--c-ink') }} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: themeColor('--c-muted') }} tickFormatter={short} axisLine={false} tickLine={false} width={40} />
        <Tooltip formatter={fmt} contentStyle={tip()} cursor={{ fill: themeColor('--c-paper2') }} />
        <Bar dataKey="value">{data.map((d, i) => <Cell key={i} fill={col[d.name]} />)}</Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function EstVsActual({ rows }) {
  const data = rows.filter(r => r.estimated || r.actual).map(r => ({ name: r.item.length > 14 ? r.item.slice(0, 13) + '…' : r.item, Estimated: r.estimated, Actual: r.actual }))
  if (!data.length) return <Empty h={280} />
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} stroke={themeColor('--c-line')} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: themeColor('--c-muted') }} interval={0} angle={-20} textAnchor="end" height={50} axisLine={{ stroke: themeColor('--c-ink') }} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: themeColor('--c-muted') }} tickFormatter={short} axisLine={false} tickLine={false} width={40} />
        <Tooltip formatter={fmt} contentStyle={tip()} cursor={{ fill: themeColor('--c-paper2') }} />
        <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="Estimated" fill={themeColor('--c-muted', .5)} /><Bar dataKey="Actual" fill={themeColor('--c-accent')} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Small SVG progress ring for summary boxes. value 0–100 (can exceed → shows red)
export function Ring({ value, size = 64, label, sub }) {
  const r = 26, c = 2 * Math.PI * r, v = Math.min(100, Math.max(0, value))
  const over = value > 100
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 64 64" className="-rotate-90 shrink-0">
        <circle cx="32" cy="32" r={r} className="ring stroke-line" />
        <circle cx="32" cy="32" r={r} className={`ring ${over ? 'stroke-bad' : value >= 100 ? 'stroke-ok' : 'stroke-accent'}`} strokeDasharray={`${c * v / 100} ${c}`} strokeLinecap="butt" style={{ transition: 'stroke-dasharray .6s' }} />
      </svg>
      <div><p className="text-xl font-medium tabular-nums leading-none">{Math.round(value)}%</p>{label && <p className="text-xs text-muted mt-1">{label}</p>}{sub && <p className="text-xs text-muted">{sub}</p>}</div>
    </div>
  )
}

const Empty = ({ h = 260 }) => <div style={{ height: h }} className="grid place-items-center text-sm text-muted font-light">Add some numbers to see the chart</div>
