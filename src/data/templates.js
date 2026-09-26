// Module templates. Add a new module type here — the UI picks it up automatically.
export const MODULE_TYPES = {
  monthly: {
    label: 'Monthly salary tracker', desc: 'In-hand salary, EMIs, SIPs and day-to-day spend — with quick add and history.', icon: 'Wallet', kind: 'monthly',
    seed: {
      income:   [{ category: 'In-hand salary', amount: '' }, { category: 'Freelance / side income', amount: '' }],
      fixed:    [{ category: 'Rent', amount: '' }, { category: 'Home / Car EMI', amount: '' }, { category: 'SIP / Mutual funds', amount: '' }, { category: 'Insurance premium', amount: '' }, { category: 'Electricity & water', amount: '' }, { category: 'Mobile & broadband', amount: '' }, { category: 'Domestic help', amount: '' }],
      variable: [{ category: 'Groceries', amount: '', budget: '' }, { category: 'Dining & food delivery', amount: '', budget: '' }, { category: 'Fuel / Cab / Metro', amount: '', budget: '' }, { category: 'Shopping', amount: '', budget: '' }, { category: 'Entertainment & OTT', amount: '', budget: '' }, { category: 'Medical', amount: '', budget: '' }, { category: 'Family / gifts', amount: '', budget: '' }],
      history:  []   // { date, section, category, detail, amount }
    }
  },
  wedding: {
    label: 'Wedding planner', desc: 'Venue to varmala — estimate vs actual for every line.', icon: 'Heart', kind: 'planner', askName: 'Whose wedding? (e.g. Priya & Arjun)',
    seed: ['Venue & mandap', 'Catering', 'Bridal outfits & jewellery', 'Groom outfits', 'Photography & video', 'Decor & flowers', 'Mehendi & sangeet', 'DJ / band', 'Invitations', 'Pandit & rituals', 'Guest travel & stay', 'Return gifts', 'Honeymoon'].map(i => ({ item: i, estimated: '', actual: '', note: '' }))
  },
  trip: {
    label: 'Trip planner', desc: 'Flights, hotels and daily allowance for your next getaway.', icon: 'Plane', kind: 'planner', askName: 'Where are you going? (e.g. Goa, Bali, Manali)', hero: true,
    seed: ['Flights / train', 'Hotels & stays', 'Local transport', 'Daily allowance (food)', 'Activities & entry tickets', 'Shopping', 'Visa & insurance', 'SIM / forex charges', 'Buffer (10%)'].map(i => ({ item: i, estimated: '', actual: '', note: '' }))
  },
  goals: {
    label: 'Goal setter', desc: 'Emergency fund, down payment, new bike — tick them off as you hit them.', icon: 'Target', kind: 'goals',
    seed: [{ goal: 'Emergency fund (6 months expenses)', target: '', saved: '', deadline: '', done: '' }, { goal: 'Home down payment', target: '', saved: '', deadline: '', done: '' }]
  }
}

export const HEADERS = {
  monthly: ['Section', 'Category', 'Amount', 'Budget', 'Detail', 'Date'],
  planner: ['Item', 'Estimated', 'Actual', 'Note'],
  goals:   ['Goal', 'Target', 'Saved', 'Deadline', 'Done']
}

export function toRows(kind, data) {
  if (kind === 'monthly') return [HEADERS.monthly,
    ...['income', 'fixed', 'variable'].flatMap(s => data[s].map(r => [s, r.category, r.amount, r.budget ?? '', '', ''])),
    ...(data.history || []).map(h => ['history', h.category, h.amount, h.section || 'variable', h.detail || '', h.date || ''])]
  if (kind === 'planner') return [HEADERS.planner, ...data.map(r => [r.item, r.estimated, r.actual, r.note])]
  return [HEADERS.goals, ...data.map(r => [r.goal, r.target, r.saved, r.deadline, r.done ? 'yes' : ''])]
}

export function fromRows(kind, rows) {
  const body = rows.slice(1)
  if (kind === 'monthly') {
    const d = { income: [], fixed: [], variable: [], history: [] }
    body.forEach(([s, category, amount, budget, detail, date]) => {
      if (s === 'history') d.history.push({ date: date ?? '', section: budget || 'variable', category, detail: detail ?? '', amount: amount ?? '' })
      else d[s]?.push({ category, amount: amount ?? '', budget: budget ?? '' })
    })
    return d
  }
  if (kind === 'planner') return body.map(([item, estimated, actual, note]) => ({ item, estimated: estimated ?? '', actual: actual ?? '', note: note ?? '' }))
  return body.map(([goal, target, saved, deadline, done]) => ({ goal, target: target ?? '', saved: saved ?? '', deadline: deadline ?? '', done: done === 'yes' }))
}

// Apply a quick-add transaction to monthly data (adds history row and bumps the category total)
export function applyTransaction(data, t) {
  const section = t.section || 'variable'
  const list = data[section].slice()
  const i = list.findIndex(r => r.category.toLowerCase() === t.category.toLowerCase())
  if (i >= 0) list[i] = { ...list[i], amount: String((parseFloat(list[i].amount) || 0) + parseFloat(t.amount)) }
  else list.push({ category: t.category, amount: String(t.amount), ...(section === 'variable' ? { budget: '' } : {}) })
  return { ...data, [section]: list, history: [...(data.history || []), t] }
}
export function removeTransaction(data, idx) {
  const t = data.history[idx]; const section = t.section || 'variable'
  const list = data[section].map(r => r.category.toLowerCase() === t.category.toLowerCase() ? { ...r, amount: String(Math.max(0, (parseFloat(r.amount) || 0) - parseFloat(t.amount))) } : r)
  return { ...data, [section]: list, history: data.history.filter((_, j) => j !== idx) }
}
// "Load from last month": carry over income, fixed amounts, variable categories + budgets (spend reset)
export function carryForward(prev) {
  return { income: prev.income.map(r => ({ ...r })), fixed: prev.fixed.map(r => ({ ...r })), variable: prev.variable.map(r => ({ ...r, amount: '' })), history: [] }
}
