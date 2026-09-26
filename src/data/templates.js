// Module templates. Add a new module type here — the UI picks it up automatically.
export const MODULE_TYPES = {
  monthly: {
    label: 'Monthly salary tracker', desc: 'In-hand salary, EMIs, SIPs and day-to-day spend.', icon: 'Wallet',
    kind: 'monthly',
    seed: {
      income:   [{ category: 'In-hand salary', amount: '' }, { category: 'Freelance / side income', amount: '' }],
      fixed:    [{ category: 'Rent', amount: '' }, { category: 'Home / Car EMI', amount: '' }, { category: 'SIP / Mutual funds', amount: '' }, { category: 'Insurance premium', amount: '' }, { category: 'Electricity & water', amount: '' }, { category: 'Mobile & broadband', amount: '' }, { category: 'Domestic help', amount: '' }],
      variable: [{ category: 'Groceries', amount: '', budget: '' }, { category: 'Dining & food delivery', amount: '', budget: '' }, { category: 'Fuel / Cab / Metro', amount: '', budget: '' }, { category: 'Shopping', amount: '', budget: '' }, { category: 'Entertainment & OTT', amount: '', budget: '' }, { category: 'Medical', amount: '', budget: '' }, { category: 'Family / gifts', amount: '', budget: '' }]
    }
  },
  wedding: {
    label: 'Wedding planner', desc: 'Venue to varmala — estimate vs actual for every line.', icon: 'Heart',
    kind: 'planner', askName: 'Whose wedding? (e.g. Priya & Arjun)',
    seed: ['Venue & mandap', 'Catering', 'Bridal outfits & jewellery', 'Groom outfits', 'Photography & video', 'Decor & flowers', 'Mehendi & sangeet', 'DJ / band', 'Invitations', 'Pandit & rituals', 'Guest travel & stay', 'Return gifts', 'Honeymoon'].map(i => ({ item: i, estimated: '', actual: '', note: '' }))
  },
  trip: {
    label: 'Trip planner', desc: 'Flights, hotels and daily allowance for your next getaway.', icon: 'Plane',
    kind: 'planner', askName: 'Where are you going? (e.g. Goa, Bali, Manali)', hero: true,
    seed: ['Flights / train', 'Hotels & stays', 'Local transport', 'Daily allowance (food)', 'Activities & entry tickets', 'Shopping', 'Visa & insurance', 'SIM / forex charges', 'Buffer (10%)'].map(i => ({ item: i, estimated: '', actual: '', note: '' }))
  },
  goals: {
    label: 'Goal setter', desc: 'Emergency fund, down payment, new bike — track progress.', icon: 'Target',
    kind: 'goals',
    seed: [{ goal: 'Emergency fund (6 months expenses)', target: '', saved: '', deadline: '' }, { goal: 'Home down payment', target: '', saved: '', deadline: '' }]
  }
}

// Sheet row schemas (header rows) per kind
export const HEADERS = {
  monthly: ['Section', 'Category', 'Amount', 'Budget'],
  planner: ['Item', 'Estimated', 'Actual', 'Note'],
  goals:   ['Goal', 'Target', 'Saved', 'Deadline']
}

// Convert module data <-> sheet rows
export function toRows(kind, data) {
  if (kind === 'monthly') return [HEADERS.monthly, ...['income', 'fixed', 'variable'].flatMap(s => data[s].map(r => [s, r.category, r.amount, r.budget ?? '']))]
  if (kind === 'planner') return [HEADERS.planner, ...data.map(r => [r.item, r.estimated, r.actual, r.note])]
  return [HEADERS.goals, ...data.map(r => [r.goal, r.target, r.saved, r.deadline])]
}

export function fromRows(kind, rows) {
  const body = rows.slice(1)
  if (kind === 'monthly') {
    const d = { income: [], fixed: [], variable: [] }
    body.forEach(([s, category, amount, budget]) => d[s]?.push({ category, amount: amount ?? '', budget: budget ?? '' }))
    return d
  }
  if (kind === 'planner') return body.map(([item, estimated, actual, note]) => ({ item, estimated: estimated ?? '', actual: actual ?? '', note: note ?? '' }))
  return body.map(([goal, target, saved, deadline]) => ({ goal, target: target ?? '', saved: saved ?? '', deadline: deadline ?? '' }))
}
