import { useEffect, useState, useCallback } from 'react'
import { LogOut, Plus, Lock, ExternalLink, WifiOff } from 'lucide-react'
import { watchAuth, signIn, signOut, loadProfile, saveProfile, canCreateModule, FREE_MODULES } from '@/lib/firebase'
import { setSheetsUser, ensureMaster, addTab, deleteTab, writeTab, sheetUrl } from '@/lib/sheetsApi'
import { clearToken } from '@/lib/googleAuth'
import { cacheGet, cacheSet, cacheClear } from '@/lib/storage'
import { MODULE_TYPES, toRows } from '@/data/templates'
import { uid } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Login from '@/components/Login'
import ModuleHome from '@/components/ModuleHome'
import MonthlyTracker from '@/modules/MonthlyTracker'
import Planner from '@/modules/Planner'
import Goals from '@/modules/Goals'
import Paywall from '@/components/Paywall'

export default function App() {
  const [user, setUser] = useState(undefined)         // undefined = loading
  const [profile, setProfile] = useState(null)
  const [active, setActive] = useState(null)           // module id
  const [paywall, setPaywall] = useState(false)
  const [busy, setBusy] = useState('')
  const [online, setOnline] = useState(navigator.onLine)
  const [err, setErr] = useState('')

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => watchAuth(async (u) => {
    setUser(u)
    if (!u) { setProfile(null); return }
    setSheetsUser(u.email)
    const cached = cacheGet('profile')
    if (cached) setProfile(cached)
    try {
      const p = await loadProfile(u.uid)
      setProfile(p); cacheSet('profile', p)
    } catch (e) { if (!cached) setErr(e.message) }
  }), [])

  // Razorpay success redirect → https://tracker.workslab.in/?paid=1
  useEffect(() => {
    if (profile && new URLSearchParams(location.search).get('paid') === '1' && !profile.paid) {
      persistProfile({ paid: true }); history.replaceState(null, '', '/')
    }
  }, [profile])

  const persistProfile = useCallback(async (patch) => {
    const next = { ...profile, ...patch }
    setProfile(next); cacheSet('profile', next)
    try { await saveProfile(user.uid, patch) } catch (e) { setErr('Profile save failed: ' + e.message) }
  }, [profile, user])

  // Make sure the master spreadsheet exists (creates it on first use)
  const getMaster = useCallback(async () => {
    setBusy('Connecting to your Google Sheet…')
    try {
      const id = await ensureMaster(profile?.spreadsheetId)
      if (id !== profile?.spreadsheetId) await persistProfile({ spreadsheetId: id })
      return id
    } finally { setBusy('') }
  }, [profile, persistProfile])

  async function createModule(type, name, meta = {}) {
    if (!canCreateModule(profile)) { setPaywall(true); return }
    const t = MODULE_TYPES[type]
    const id = uid()
    const tab = `${t.label.split(' ')[0]} · ${name}`.slice(0, 95)
    const mod = { id, type, name, tab, meta, createdAt: Date.now() }
    const seed = t.seed
    try {
      const sid = await getMaster()
      setBusy('Creating tab in your sheet…')
      await addTab(sid, tab)
      await writeTab(sid, tab, toRows(t.kind, seed))
      cacheSet(`mod:${id}`, seed)
      await persistProfile({ modules: [...profile.modules, mod], moduleCount: profile.moduleCount + 1 })
      setActive(id)
    } catch (e) { setErr(e.message) } finally { setBusy('') }
  }

  async function removeModule(mod) {
    if (!confirm(`Delete "${mod.name}"? The tab in your Google Sheet will also be removed.`)) return
    try {
      if (profile.spreadsheetId) await deleteTab(profile.spreadsheetId, mod.tab)
      await persistProfile({ modules: profile.modules.filter(m => m.id !== mod.id) })
      if (active === mod.id) setActive(null)
    } catch (e) { setErr(e.message) }
  }

  async function logout() { clearToken(); cacheClear(); await signOut(); setActive(null) }

  if (user === undefined) return <Splash />
  if (!user) return <Login onSignIn={() => signIn().catch(e => setErr(e.message))} err={err} />
  if (!profile) return <Splash text="Loading your workspace…" />

  const mod = profile.modules.find(m => m.id === active)
  const remaining = Math.max(0, FREE_MODULES - profile.moduleCount)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-ink">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button onClick={() => setActive(null)} className="flex items-center gap-2 font-medium">
            <span className="w-2.5 h-2.5 bg-accent" /> Works Lab <span className="font-light text-neutral-500 hidden sm:inline">Tracker</span>
          </button>
          <div className="flex items-center gap-2 text-xs">
            {!online && <span className="flex items-center gap-1 text-accent"><WifiOff size={14} /> Offline — changes will sync</span>}
            {profile.spreadsheetId && (
              <a href={sheetUrl(profile.spreadsheetId)} target="_blank" rel="noopener" className="hidden sm:flex items-center gap-1 text-neutral-500 hover:text-ink">
                Open Google Sheet <ExternalLink size={13} />
              </a>
            )}
            <span className="hidden md:inline text-neutral-500">{profile.paid ? 'Unlimited' : `${remaining} free modules left`}</span>
            <img src={user.photoURL} alt="" className="w-8 h-8 border border-ink" referrerPolicy="no-referrer" />
            <Button variant="ghost" size="icon" onClick={logout} title="Sign out"><LogOut size={16} /></Button>
          </div>
        </div>
      </header>

      {err && (
        <div className="bg-bad text-white text-sm px-4 py-2 flex justify-between max-w-7xl mx-auto w-full">
          <span>{err}</span><button onClick={() => setErr('')}>✕</button>
        </div>
      )}
      {busy && <div className="bg-ink text-white text-xs px-4 py-2 text-center">{busy}</div>}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {!mod ? (
          <ModuleHome profile={profile} onOpen={setActive} onCreate={createModule} onDelete={removeModule} locked={!canCreateModule(profile)} onLocked={() => setPaywall(true)} />
        ) : (
          <ModuleView key={mod.id} mod={mod} profile={profile} onBack={() => setActive(null)} setErr={setErr} />
        )}
      </main>

      <footer className="border-t border-neutral-200 text-xs text-neutral-500 py-4 px-4 text-center">
        Your data is stored in <b>your</b> Google Drive, not on our servers. · <a className="underline" href="https://workslab.in">workslab.in</a>
      </footer>

      {paywall && <Paywall onClose={() => setPaywall(false)} onPaid={() => { persistProfile({ paid: true }); setPaywall(false) }} />}
    </div>
  )
}

function ModuleView({ mod, profile, onBack, setErr }) {
  const kind = MODULE_TYPES[mod.type].kind
  const props = { mod, spreadsheetId: profile.spreadsheetId, onBack, setErr }
  if (kind === 'monthly') return <MonthlyTracker {...props} />
  if (kind === 'goals') return <Goals {...props} />
  return <Planner {...props} />
}

function Splash({ text = 'Loading…' }) {
  return <div className="min-h-screen grid place-items-center text-sm text-neutral-500"><div className="flex items-center gap-3"><span className="w-2.5 h-2.5 bg-accent animate-pulse" />{text}</div></div>
}
