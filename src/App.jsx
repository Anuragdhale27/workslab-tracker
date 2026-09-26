import { useEffect, useState, useCallback } from 'react'
import { LogOut, ExternalLink, WifiOff } from 'lucide-react'
import { watchAuth, signIn, signOut, loadProfile, saveProfile, canCreateModule, hasFullAccess } from '@/lib/firebase'
import { setSheetsUser, ensureMaster, addTab, deleteTab, writeTab, readRange, sheetUrl } from '@/lib/sheetsApi'
import { clearToken } from '@/lib/googleAuth'
import { cacheGet, cacheSet, cacheClear } from '@/lib/storage'
import { MODULE_TYPES, toRows, fromRows, applyTransaction, carryForward } from '@/data/templates'
import { uid, monthKey, monthLabel } from '@/lib/utils'
import { DEFAULT_THEME, PRICING } from '@/config'
import { Button } from '@/components/ui/button'
import Landing from '@/components/Landing'
import ModuleHome from '@/components/ModuleHome'
import ThemePicker from '@/components/ThemePicker'
import QuickAdd from '@/components/QuickAdd'
import Paywall from '@/components/Paywall'
import MonthlyTracker from '@/modules/MonthlyTracker'
import Planner from '@/modules/Planner'
import Goals from '@/modules/Goals'

const applyTheme = (t) => (document.documentElement.dataset.theme = t || DEFAULT_THEME)

export default function App() {
  const [user, setUser] = useState(undefined)
  const [profile, setProfile] = useState(null)
  const [active, setActive] = useState(null)
  const [paywall, setPaywall] = useState(false)
  const [busy, setBusy] = useState('')
  const [online, setOnline] = useState(navigator.onLine)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [version, setVersion] = useState(0)     // bump to remount open module after quick add / refresh
  const [refreshing, setRefreshing] = useState(false)
  const toast = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500) }

  useEffect(() => { applyTheme(DEFAULT_THEME) }, [])
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => watchAuth(async (u) => {
    setUser(u)
    if (!u) { setProfile(null); applyTheme(DEFAULT_THEME); return }
    setSheetsUser(u.email)
    const cached = cacheGet('profile')
    if (cached) { setProfile(cached); applyTheme(cached.theme) }
    try { const p = await loadProfile(u.uid); setProfile(p); cacheSet('profile', p); applyTheme(p.theme) }
    catch (e) { if (!cached) setErr(e.message) }
  }), [])

  const persistProfile = useCallback(async (patch) => {
    const next = { ...profile, ...patch }
    setProfile(next); cacheSet('profile', next)
    try { await saveProfile(user.uid, patch) } catch (e) { setErr('Profile save failed: ' + e.message) }
  }, [profile, user])

  // Razorpay success redirect → /?paid=1
  useEffect(() => {
    if (profile && new URLSearchParams(location.search).get('paid') === '1' && !hasFullAccess(profile)) {
      persistProfile({ plan: 'paid', paidAt: Date.now() }); history.replaceState(null, '', '/')
    }
  }, [profile])

  const getMaster = useCallback(async () => {
    setBusy('Connecting to your Google Sheet…')
    try {
      const id = await ensureMaster(profile?.spreadsheetId)
      if (id !== profile?.spreadsheetId) await persistProfile({ spreadsheetId: id })
      return id
    } finally { setBusy('') }
  }, [profile, persistProfile])

  // ---- create module ----
  async function createModule(type, name, meta = {}, seedOverride, { silent } = {}) {
    if (!canCreateModule(profile)) { setPaywall(true); return null }
    const t = MODULE_TYPES[type]
    const id = uid()
    const tab = `${t.label.split(' ')[0]} · ${name}`.slice(0, 95)
    const mod = { id, type, name, tab, meta, archived: false, createdAt: Date.now() }
    const seed = seedOverride || t.seed
    try {
      const sid = await getMaster()
      setBusy('Creating tab in your sheet…')
      await addTab(sid, tab)
      await writeTab(sid, tab, toRows(t.kind, seed))
      cacheSet(`mod:${id}`, seed)
      await persistProfile({ modules: [...profile.modules, mod] })
      if (!silent) setActive(id)
      return mod
    } catch (e) { setErr(e.message); return null } finally { setBusy('') }
  }

  const monthlyFor = (key) => profile.modules.find(m => m.type === 'monthly' && (m.meta?.month === key || (!m.meta?.month && m.name === monthLabel(new Date(key + '-01')))))
  const latestMonthlyBefore = (key) => profile.modules.filter(m => m.type === 'monthly' && m.meta?.month && m.meta.month < key).sort((a, b) => b.meta.month.localeCompare(a.meta.month))[0]

  // Monthly: create for a month, carrying forward setup from the latest previous month if cached
  async function createMonthly(key = monthKey(), silent = false) {
    if (monthlyFor(key)) { setActive(monthlyFor(key).id); return monthlyFor(key) }
    const [y, m] = key.split('-').map(Number)
    const prev = latestMonthlyBefore(key)
    const seed = prev && cacheGet(`mod:${prev.id}`) ? carryForward(cacheGet(`mod:${prev.id}`)) : undefined
    return createModule('monthly', monthLabel(new Date(y, m - 1, 1)), { month: key }, seed, { silent })
  }

  // ---- Quick add transaction → that month's tracker (created if missing) ----
  async function quickAdd(t) {
    const key = t.date.slice(0, 7)
    let mod = monthlyFor(key)
    try {
      if (!mod) { mod = await createMonthly(key, true); if (!mod) return }
      const sid = profile.spreadsheetId || await getMaster()
      let data = cacheGet(`mod:${mod.id}`)
      if (navigator.onLine) { try { const rows = await readRange(sid, `${mod.tab}!A1:F2000`); if (rows.length > 1) data = fromRows('monthly', rows) } catch { /* fall back to cache */ } }
      if (!data) data = MODULE_TYPES.monthly.seed
      const next = applyTransaction(data, t)
      cacheSet(`mod:${mod.id}`, next)
      await writeTab(sid, mod.tab, toRows('monthly', next))
      setVersion(v => v + 1)
      toast(`Added to ${mod.name}`)
    } catch (e) { setErr(e.message) }
  }

  // ---- Refresh all active modules from Sheet (home analysis) ----
  async function refreshAll() {
    if (!profile?.spreadsheetId || !navigator.onLine) return
    setRefreshing(true)
    try {
      for (const m of profile.modules.filter(m => !m.archived)) {
        const rows = await readRange(profile.spreadsheetId, `${m.tab}!A1:F2000`)
        if (rows.length > 1) cacheSet(`mod:${m.id}`, fromRows(MODULE_TYPES[m.type].kind, rows))
      }
      setVersion(v => v + 1)
    } catch (e) { setErr(e.message) } finally { setRefreshing(false) }
  }
  useEffect(() => { if (profile?.spreadsheetId && !active && profile.modules.length) refreshAll() }, [profile?.spreadsheetId, active])

  async function removeModule(mod) {
    if (!confirm(`Delete "${mod.name}"? The tab in your Google Sheet will also be removed.`)) return
    try {
      if (profile.spreadsheetId) await deleteTab(profile.spreadsheetId, mod.tab)
      await persistProfile({ modules: profile.modules.filter(m => m.id !== mod.id) })
      if (active === mod.id) setActive(null)
    } catch (e) { setErr(e.message) }
  }
  const archiveModule = (mod, archived) => persistProfile({ modules: profile.modules.map(m => m.id === mod.id ? { ...m, archived } : m) }).then(() => { if (archived && active === mod.id) setActive(null) })
  const setTheme = (theme) => { applyTheme(theme); persistProfile({ theme }) }
  async function logout() { clearToken(); cacheClear(); await signOut(); setActive(null) }

  if (user === undefined) return <Splash />
  if (!user) return <Landing onSignIn={() => signIn().catch(e => setErr(e.message))} err={err} />
  if (!profile) return <Splash text="Loading your workspace…" />

  const mod = profile.modules.find(m => m.id === active)
  const curMonthly = monthlyFor(monthKey())
  const curData = curMonthly && cacheGet(`mod:${curMonthly.id}`)
  const categories = curData ? { income: curData.income.map(r => r.category), fixed: curData.fixed.map(r => r.category), variable: curData.variable.map(r => r.category) } : null
  const planLabel = profile.plan === 'founder' ? `Founder #${profile.userNumber} · free forever` : profile.plan === 'paid' ? 'Unlimited' : `Trial · ${PRICING.FREE_TRIAL_MODULES} tracker`

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-ink">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button onClick={() => setActive(null)} className="flex items-center gap-2 font-medium"><span className="w-2.5 h-2.5 bg-accent" /> Works Lab <span className="font-light text-muted hidden sm:inline">Tracker</span></button>
          <div className="flex items-center gap-1 sm:gap-2 text-xs">
            {!online && <span className="flex items-center gap-1 text-accent"><WifiOff size={14} /> Offline</span>}
            {profile.spreadsheetId && <a href={sheetUrl(profile.spreadsheetId)} target="_blank" rel="noopener" className="hidden md:flex items-center gap-1 text-muted hover:text-ink">Open Sheet <ExternalLink size={13} /></a>}
            <button onClick={() => !hasFullAccess(profile) && setPaywall(true)} className={`hidden sm:inline ${hasFullAccess(profile) ? 'text-muted' : 'text-accent underline'}`}>{planLabel}</button>
            <ThemePicker value={profile.theme} onChange={setTheme} />
            <img src={user.photoURL} alt="" className="w-8 h-8 border border-ink" referrerPolicy="no-referrer" />
            <Button variant="ghost" size="icon" onClick={logout} title="Sign out"><LogOut size={16} /></Button>
          </div>
        </div>
      </header>

      {err && <div className="bg-bad text-white text-sm px-4 py-2 flex justify-between max-w-7xl mx-auto w-full"><span>{err}</span><button onClick={() => setErr('')}>✕</button></div>}
      {busy && <div className="bg-ink text-paper text-xs px-4 py-2 text-center">{busy}</div>}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 pb-24">
        {!mod
          ? <ModuleHome profile={profile} version={version} refreshing={refreshing} onRefresh={refreshAll} onOpen={setActive}
              onCreate={(type, name, meta) => type === 'monthly' ? createMonthly() : createModule(type, name, meta)}
              onDelete={removeModule} onArchive={archiveModule} locked={!canCreateModule(profile)} onLocked={() => setPaywall(true)} />
          : <ModuleView key={mod.id + ':' + version} mod={mod} spreadsheetId={profile.spreadsheetId} onBack={() => setActive(null)} setErr={setErr} onArchive={archiveModule}
              loadPrev={() => { const p = latestMonthlyBefore(mod.meta?.month || monthKey()); return p ? cacheGet(`mod:${p.id}`) : null }} />}
      </main>

      <QuickAdd categories={categories} onAdd={quickAdd} />
      {msg && <div className="fixed bottom-24 right-5 z-40 bg-ink text-paper text-sm px-4 py-2">{msg}</div>}

      <footer className="border-t border-line text-xs text-muted py-4 px-4 text-center">Your data is stored in <b>your</b> Google Drive, not on our servers. · <a className="underline" href="https://workslab.in">workslab.in</a></footer>
      {paywall && <Paywall onClose={() => setPaywall(false)} onPaid={() => { persistProfile({ plan: 'paid' }); setPaywall(false) }} />}
    </div>
  )
}

function ModuleView(props) {
  const kind = MODULE_TYPES[props.mod.type].kind
  if (kind === 'monthly') return <MonthlyTracker {...props} />
  if (kind === 'goals') return <Goals {...props} />
  return <Planner {...props} />
}

function Splash({ text = 'Loading…' }) {
  return <div className="min-h-screen grid place-items-center text-sm text-muted"><div className="flex items-center gap-3"><span className="w-2.5 h-2.5 bg-accent animate-pulse" />{text}</div></div>
}
