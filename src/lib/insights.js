// Insights engine — rule based, tuned for Indian salaried households.
import { num, sum, inr } from './utils'

export function analyse({ income = [], fixed = [], variable = [] }) {
  const inc = sum(income, 'amount')
  const fix = sum(fixed, 'amount')
  const spent = sum(variable, 'amount')
  const total = fix + spent
  const saved = inc - total
  const out = []
  if (!inc) return [{ tone: 'info', text: 'Add your in-hand salary to unlock insights.' }]

  const rate = saved / inc
  if (rate >= 0.3) out.push({ tone: 'good', text: `Great job — you saved ${Math.round(rate * 100)}% of your income this month.` })
  else if (rate >= 0.2) out.push({ tone: 'good', text: `Solid month. ${Math.round(rate * 100)}% saved — you're on the 50/30/20 track.` })
  else if (rate >= 0) out.push({ tone: 'warn', text: `Only ${Math.round(rate * 100)}% saved. Aim for at least 20% of in-hand salary.` })
  else out.push({ tone: 'bad', text: `You spent ${inr(-saved)} more than you earned this month.` })

  const emi = fixed.filter(r => /emi|loan/i.test(r.category)).reduce((a, r) => a + num(r.amount), 0)
  if (emi / inc > 0.4) out.push({ tone: 'bad', text: `EMIs are ${Math.round(emi / inc * 100)}% of income. Banks flag anything above 40% — avoid new loans.` })

  const rent = fixed.filter(r => /rent/i.test(r.category)).reduce((a, r) => a + num(r.amount), 0)
  if (rent / inc > 0.3) out.push({ tone: 'warn', text: `Rent is ${Math.round(rent / inc * 100)}% of income — above the 30% comfort line.` })

  const sip = [...fixed, ...variable].filter(r => /sip|mutual|invest|ppf|nps/i.test(r.category)).reduce((a, r) => a + num(r.amount), 0)
  if (sip === 0) out.push({ tone: 'info', text: 'No SIP or investment line found. Even ₹1,000/month compounds meaningfully over 10 years.' })

  variable.forEach(r => {
    const b = num(r.budget), a = num(r.amount)
    if (b > 0 && a > b) out.push({ tone: 'bad', text: `Overspending on ${r.category} by ${Math.round((a - b) / b * 100)}% (${inr(a - b)} over budget).` })
    else if (b > 0 && a < b * 0.7 && a > 0) out.push({ tone: 'good', text: `${r.category} is ${Math.round((1 - a / b) * 100)}% under budget.` })
  })

  const top = [...variable].sort((a, b) => num(b.amount) - num(a.amount))[0]
  if (top && num(top.amount) > spent * 0.35 && spent > 0) out.push({ tone: 'info', text: `${top.category} alone is ${Math.round(num(top.amount) / spent * 100)}% of your variable spend.` })

  return out.slice(0, 6)
}
