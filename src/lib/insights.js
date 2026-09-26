// Insights engine — rule based, tuned for Indian salaried households.
import { num, sum, inr } from './utils'

export function analyse({ income = [], fixed = [], variable = [] }) {
  const inc = sum(income, 'amount'), fix = sum(fixed, 'amount'), spent = sum(variable, 'amount')
  const saved = inc - fix - spent
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
  if (top && spent > 0 && num(top.amount) > spent * 0.35) out.push({ tone: 'info', text: `${top.category} alone is ${Math.round(num(top.amount) / spent * 100)}% of your variable spend.` })
  return out.slice(0, 6)
}

// Real money-management suggestions for the home page. Computed from whatever data exists; falls back to principles.
export function suggestions({ monthly, goals }) {
  const s = []
  const inc = monthly ? sum(monthly.income, 'amount') : 0
  const outgo = monthly ? sum(monthly.fixed, 'amount') + sum(monthly.variable, 'amount') : 0
  const ef = goals?.flat().find(g => /emergency/i.test(g.goal))
  if (outgo) {
    const target = outgo * 6
    const have = ef ? num(ef.saved) : 0
    s.push({ title: 'Emergency fund', text: have >= target ? `You're covered — ${inr(have)} is 6+ months of expenses.` : `Aim for ${inr(target)} (6 × monthly outgo). ${have ? `You're at ${Math.round(have / target * 100)}%.` : 'Start a "Goal setter" line for it.'}`, ok: have >= target })
  } else s.push({ title: 'Emergency fund', text: 'Keep 6 months of expenses in a liquid fund or sweep-in FD before investing anywhere else.' })
  if (inc) {
    s.push({ title: 'Term insurance', text: `Cover should be ~15× annual income: about ${inr(inc * 12 * 15)}. Pure term plans are cheap; skip ULIPs and endowment.` })
    const sip = monthly.fixed.concat(monthly.variable).filter(r => /sip|mutual|invest|ppf|nps/i.test(r.category)).reduce((a, r) => a + num(r.amount), 0)
    s.push({ title: 'Investing', text: sip ? `You invest ${Math.round(sip / inc * 100)}% of income. Step your SIP up 10% every appraisal — it roughly doubles the final corpus.` : 'Automate a SIP on salary day — pay yourself first, spend what is left.', ok: sip / inc >= 0.2 })
  } else {
    s.push({ title: 'Pay yourself first', text: 'Set up a SIP that debits on salary day. Investing what is left rarely works; spending what is left always does.' })
  }
  s.push({ title: 'Tax saving', text: 'Old regime: ₹1.5L under 80C (ELSS, PPF, EPF) + ₹50k NPS (80CCD1B) + health premium (80D). New regime: skip the lock-ins and invest freely — compare both each April.' })
  s.push({ title: 'Health cover', text: 'Employer cover ends when the job does. A personal family floater (₹10–25L) costs less than one hospital bill.' })
  s.push({ title: 'Credit card rule', text: 'Pay the full statement every month. 36–42% APR wipes out every reward point you will ever earn.' })
  return s
}
