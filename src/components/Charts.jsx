import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { inr } from '@/lib/utils'

const COLORS = ['#000000', '#ff3d00', '#555555', '#ff8a5c', '#8a8a8a', '#ffb899', '#bdbdbd', '#333333']
const fmt = (v) => inr(v)

export function ExpensePie({ data }) {
  const rows = data.filter(d => d.value > 0)
  if (!rows.length) return <Empty />
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={rows} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2} stroke="#fff">
          {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={fmt} contentStyle={{ border: '1px solid #000', borderRadius: 0, fontSize: 12 }} />
        <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function IncomeVsSpend({ income, fixed, variable }) {
  const data = [{ name: 'Income', value: income }, { name: 'Fixed', value: fixed }, { name: 'Variable', value: variable }, { name: 'Saved', value: Math.max(0, income - fixed - variable) }]
  if (!income && !fixed && !variable) return <Empty />
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} stroke="#e5e5e5" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={{ stroke: '#000' }} tickLine={false} />
        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} axisLine={false} tickLine={false} width={40} />
        <Tooltip formatter={fmt} contentStyle={{ border: '1px solid #000', borderRadius: 0, fontSize: 12 }} cursor={{ fill: '#f6f6f4' }} />
        <Bar dataKey="value" radius={0}>{data.map((d, i) => <Cell key={i} fill={d.name === 'Saved' ? '#0a8a3a' : d.name === 'Income' ? '#000' : '#ff3d00'} />)}</Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function EstVsActual({ rows }) {
  const data = rows.filter(r => r.estimated || r.actual).map(r => ({ name: r.item.length > 14 ? r.item.slice(0, 13) + '…' : r.item, Estimated: r.estimated, Actual: r.actual }))
  if (!data.length) return <Empty />
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} stroke="#e5e5e5" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} axisLine={{ stroke: '#000' }} tickLine={false} />
        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 100000 ? `${(v / 100000).toFixed(1)}L` : `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={40} />
        <Tooltip formatter={fmt} contentStyle={{ border: '1px solid #000', borderRadius: 0, fontSize: 12 }} cursor={{ fill: '#f6f6f4' }} />
        <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="Estimated" fill="#bdbdbd" /><Bar dataKey="Actual" fill="#ff3d00" />
      </BarChart>
    </ResponsiveContainer>
  )
}

const Empty = () => <div className="h-[260px] grid place-items-center text-sm text-neutral-400 font-light">Add some numbers to see the chart</div>
