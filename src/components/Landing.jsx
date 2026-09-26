import { useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExpensePie, IncomeVsSpend, Ring } from '@/components/Charts'
import { MODULE_TYPES } from '@/data/templates'
import { PRICING } from '@/config'
import { watchStats } from '@/lib/firebase'
import { inr } from '@/lib/utils'

const G = () => <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="currentColor" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/></svg>

// Demo numbers for the landing charts (a typical Pune IT salary)
const demo = { income: 85000, fixed: 38500, variable: 24800 }
const demoPie = [['Rent', 18000], ['EMI', 9500], ['SIP', 8000], ['Groceries', 7200], ['Food delivery', 5600], ['Fuel & cab', 4100], ['Shopping', 4900], ['Bills & OTT', 6000]].map(([name, value]) => ({ name, value }))

const FAQ = [
  ['Is this an Excel template or an ebook?', 'No. It is a working web app. You type in the app, charts update instantly, and every number is written to a Google Sheet in your own Drive. Edit either side — they stay in sync.'],
  ['Where is my data stored?', 'In a spreadsheet called "Workslab Budget Ecosystem" inside your Google Drive. We never see it. Our servers only store your login and which trackers you created.'],
  ['What do the first 100 users get?', `Lifetime free access to everything — all trackers, all themes, all future modules. No card needed.`],
  ['What happens after 100 users?', `Access is a one-time ${inr(PRICING.EARLY_BIRD)} during the early-bird period (regular ${inr(PRICING.REGULAR)}). No subscription, ever.`],
  ['Does it work on my phone?', 'Yes — it is mobile-first. Quick-add an expense from the shop in five seconds; it lands in this month\'s tracker.'],
  ['Can I share it with my spouse or CA?', 'Yes. Share the Google Sheet as Viewer (or Editor) exactly like any other Google file.'],
  ['What if I don\'t track every small expense?', 'You don\'t have to. Set budgets per category and log the big ones; the monthly view still shows savings rate, EMI load and overspend alerts.']
]

export default function Landing({ onSignIn, err }) {
  const [stats, setStats] = useState(null)
  const [open, setOpen] = useState(0)
  useEffect(() => watchStats(setStats), [])
  const left = stats ? Math.max(0, PRICING.FOUNDER_SEATS - (stats.userCount || 0)) : null
  const seatsLeft = left === null || left > 0

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-ink">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="flex items-center gap-2 font-medium"><span className="w-2.5 h-2.5 bg-accent" /> Works Lab <span className="font-light text-muted hidden sm:inline">Tracker</span></span>
          <div className="flex items-center gap-4 text-sm">
            <a href="#trackers" className="hidden sm:inline text-muted hover:text-ink">Trackers</a>
            <a href="#how" className="hidden sm:inline text-muted hover:text-ink">How it works</a>
            <a href="#faq" className="hidden sm:inline text-muted hover:text-ink">FAQ</a>
            <Button size="sm" onClick={onSignIn}><G /> Sign in</Button>
          </div>
        </div>
      </header>

      {/* HERO — hook + offer */}
      <section className="border-b border-ink">
        <div className="max-w-7xl mx-auto px-4 py-14 lg:py-24 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <p className="text-xs text-muted flex items-center gap-2 mb-8"><span className="w-6 h-px bg-accent" /> Salary & budget tracker · Made for India</p>
            <h1 className="font-display text-[clamp(2.6rem,7.5vw,6rem)] leading-[.98] tracking-[-.03em] font-medium max-w-[12ch]">Know where your <em className="not-italic text-accent">salary</em> goes.</h1>
            <p className="mt-8 text-lg font-light text-ink/80 max-w-[48ch]">Track in-hand salary, EMIs, SIPs, Swiggy and the odd Big Bazaar run. Plan weddings, trips and goals. Every rupee lands in a Google Sheet in <b className="font-medium">your own Drive</b>.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={onSignIn}><G /> {seatsLeft ? 'Grab my free seat' : `Grab early-bird — ${inr(PRICING.EARLY_BIRD)}`}</Button>
              <a href="#trackers"><Button size="lg" variant="outline">See the trackers</Button></a>
            </div>
            {err && <p className="mt-3 text-sm text-bad">{err}</p>}
            <p className="mt-4 text-xs text-muted">Sign in with Google · No card · Works on mobile</p>
          </div>

          {/* OFFER CARD */}
          <div className="lg:col-span-5 border border-ink bg-paper p-6 lg:p-8 relative">
            <span className="absolute -top-3 left-6 bg-accent text-accent-ink text-xs font-medium px-3 py-1">Launch offer</span>
            <p className="text-sm text-muted">First {PRICING.FOUNDER_SEATS} users</p>
            <p className="font-display text-5xl font-medium tracking-tight mt-1">Free <span className="text-lg font-light text-muted">forever</span></p>
            {left !== null && (
              <div className="mt-4">
                <div className="h-2 bg-line"><div className="h-full bg-accent transition-all" style={{ width: `${Math.min(100, (PRICING.FOUNDER_SEATS - left) / PRICING.FOUNDER_SEATS * 100)}%` }} /></div>
                <p className="text-xs text-muted mt-1">{left > 0 ? `${left} of ${PRICING.FOUNDER_SEATS} free seats left` : 'All free seats claimed'}</p>
              </div>
            )}
            <div className="border-t border-line mt-6 pt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted">After that · early bird</p>
                <p className="text-3xl font-medium tracking-tight">{inr(PRICING.EARLY_BIRD)} <s className="text-base font-light text-muted">{inr(PRICING.REGULAR)}</s></p>
                <p className="text-xs text-muted">one-time · no subscription</p>
              </div>
              <Button variant="accent" onClick={onSignIn}>Grab now</Button>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHT strip */}
      <section className="bg-ink text-paper">
        <div className="max-w-7xl mx-auto px-4 py-6 grid sm:grid-cols-3 gap-4 text-sm">
          <p className="flex gap-3"><Icons.Zap className="text-accent shrink-0" size={20} /><span><b className="font-medium">A working app — not an Excel template or ebook.</b><br /><span className="text-paper/60 font-light">Type once, see charts instantly.</span></span></p>
          <p className="flex gap-3"><Icons.Table2 className="text-accent shrink-0" size={20} /><span><b className="font-medium">Real-time, all data in your Google Sheet.</b><br /><span className="text-paper/60 font-light">Open it in Excel any day. It is yours.</span></span></p>
          <p className="flex gap-3"><Icons.ShieldCheck className="text-accent shrink-0" size={20} /><span><b className="font-medium">We can't read your other files.</b><br /><span className="text-paper/60 font-light">Google's drive.file permission — only the sheet we create.</span></span></p>
        </div>
      </section>

      {/* VALUE — live demo dashboard */}
      <section className="border-b border-ink">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-8 mb-10">
            <div className="lg:col-span-5">
              <p className="text-xs text-muted flex items-center gap-2 mb-4"><span className="w-6 h-px bg-accent" /> What you see every month</p>
              <h2 className="font-display text-[clamp(1.8rem,4vw,3.2rem)] leading-[1.05] tracking-tight font-medium">One screen. Every rupee explained.</h2>
            </div>
            <p className="lg:col-span-7 self-end text-lg font-light text-ink/80 max-w-[56ch]">Four summary boxes, a pie of where it went, a bar of income vs spend, and plain-Hindi-simple insights: "EMIs are 44% of income — avoid new loans." Below is a demo with typical numbers.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink border border-ink mb-4">
            {[['In-hand income', demo.income, 'text-ink'], ['Fixed outgo', demo.fixed, 'text-ink'], ['Variable spend', demo.variable, 'text-ink'], ['Saved', demo.income - demo.fixed - demo.variable, 'text-ok']].map(([l, v, c]) => (
              <div key={l} className="bg-paper p-4"><p className="text-xs text-muted">{l}</p><p className={`text-xl sm:text-2xl font-medium tabular-nums tracking-tight ${c}`}>{inr(v)}</p></div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="border border-ink bg-paper p-4"><p className="text-sm font-medium mb-2">Expenses breakdown</p><ExpensePie data={demoPie} /></div>
            <div className="border border-ink bg-paper p-4"><p className="text-sm font-medium mb-2">Income vs spend</p><IncomeVsSpend {...demo} /></div>
            <div className="border border-ink bg-paper p-4 flex flex-col gap-4">
              <p className="text-sm font-medium">This month at a glance</p>
              <Ring value={(demo.income - demo.fixed - demo.variable) / demo.income * 100} label="Savings rate" sub="Target ≥ 20%" />
              <Ring value={9500 / demo.income * 100} label="EMI load" sub="Keep under 40%" />
              <Ring value={(demo.fixed + demo.variable) / demo.income * 100} label="Income used" />
              <div className="mt-auto border-l-2 border-accent pl-3 text-sm">Great job — you saved 26% of your income this month.</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRACKERS */}
      <section id="trackers" className="bg-paper-2 border-b border-ink">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <p className="text-xs text-muted flex items-center gap-2 mb-4"><span className="w-6 h-px bg-accent" /> Four trackers</p>
          <h2 className="font-display text-[clamp(1.8rem,4vw,3.2rem)] leading-[1.05] tracking-tight font-medium mb-10">Salary today. Shaadi next year. Goa in between.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ink border border-ink">
            {Object.entries(MODULE_TYPES).map(([k, t]) => { const I = Icons[t.icon]; return (
              <div key={k} className="bg-paper p-5 flex flex-col gap-3"><I className="text-accent" size={22} /><h3 className="font-medium text-lg">{t.label}</h3><p className="text-sm text-muted font-light">{t.desc}</p></div>
            )})}
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-4 text-sm">
            {[['Quick add', 'Bought groceries? Tap +, pick Groceries, type ₹1,240. It lands in this month\'s tracker with date and note.'], ['Carry forward', 'New month? Load salary, rent, EMIs and budgets from last month in one click.'], ['Archive', 'Wedding done, trip over — archive it. Clean home screen, full history in your Sheet.']].map(([h, p]) => (
              <div key={h} className="border border-ink bg-paper p-4"><p className="font-medium mb-1">{h}</p><p className="text-muted font-light">{p}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-b border-ink">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <p className="text-xs text-muted flex items-center gap-2 mb-4"><span className="w-6 h-px bg-accent" /> How it works</p>
          <h2 className="font-display text-[clamp(1.8rem,4vw,3.2rem)] leading-[1.05] tracking-tight font-medium mb-10">Three steps. Ten seconds each.</h2>
          <ol className="grid md:grid-cols-3 border-t border-ink">
            {[['Sign in with Google', 'One tap. We create "Workslab Budget Ecosystem" in your Drive — one file, nothing else touched.'], ['Pick a tracker', 'Monthly salary, wedding, trip or goals. Indian categories are pre-filled: rent, EMI, SIP, domestic help, food delivery.'], ['Type. Watch. Decide.', 'Charts and insights update as you type. Everything syncs to your Sheet in under a second. Works offline too.']].map(([h, p], i) => (
              <li key={h} className="py-8 md:pr-8 md:border-r border-b md:border-b-0 border-line last:border-0"><span className="text-3xl font-light text-accent">0{i + 1}</span><h3 className="font-medium text-lg mt-4 mb-2">{h}</h3><p className="text-muted font-light text-sm">{p}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-ink">
        <div className="max-w-3xl mx-auto px-4 py-16 lg:py-24">
          <p className="text-xs text-muted flex items-center gap-2 mb-4"><span className="w-6 h-px bg-accent" /> Questions</p>
          <h2 className="font-display text-[clamp(1.8rem,4vw,3.2rem)] leading-[1.05] tracking-tight font-medium mb-8">Straight answers.</h2>
          <div className="border-t border-ink">
            {FAQ.map(([q, a], i) => (
              <div key={q} className="border-b border-line">
                <button className="w-full text-left py-5 flex justify-between items-center gap-4 font-medium hover:text-accent" onClick={() => setOpen(open === i ? -1 : i)}>{q}<span className={`w-7 h-7 border border-ink grid place-items-center shrink-0 transition-transform ${open === i ? 'rotate-45 bg-ink text-paper' : ''}`}>+</span></button>
                {open === i && <p className="pb-5 text-muted font-light text-sm max-w-[62ch]">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-accent text-accent-ink">
        <div className="max-w-7xl mx-auto px-4 py-20 lg:py-28 grid lg:grid-cols-12 gap-8 items-end">
          <h2 className="lg:col-span-7 font-display text-[clamp(2.4rem,6vw,5rem)] leading-[1] tracking-tight font-medium max-w-[14ch]">Salary day is coming. Be ready this time.</h2>
          <div className="lg:col-span-5">
            <p className="text-lg font-light mb-6">{seatsLeft ? `${left ?? PRICING.FOUNDER_SEATS} free lifetime seats left. Then ${inr(PRICING.EARLY_BIRD)} early-bird, ${inr(PRICING.REGULAR)} regular.` : `Early-bird ${inr(PRICING.EARLY_BIRD)} (regular ${inr(PRICING.REGULAR)}). One-time.`}</p>
            <Button size="lg" className="bg-ink text-paper border-ink hover:bg-paper hover:text-ink w-full sm:w-auto" onClick={onSignIn}><G /> Grab now</Button>
          </div>
        </div>
      </section>

      <footer className="bg-ink text-paper/60 text-xs py-6 px-4 flex flex-wrap justify-between gap-2 max-w-7xl mx-auto">
        <span>© 2026 Works Lab · <a className="underline" href="https://workslab.in">workslab.in</a> · <a className="underline" href="https://resume.workslab.in">Resume Builder</a></span>
        <span>Your data stays in your Google Drive.</span>
      </footer>
    </div>
  )
}
