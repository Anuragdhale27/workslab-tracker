import { useState } from 'react'
import * as Icons from 'lucide-react'
import { MODULE_TYPES } from '@/data/templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Overview from '@/components/Overview'

export default function ModuleHome({ profile, version, refreshing, onRefresh, onOpen, onCreate, onDelete, onArchive, locked, onLocked }) {
  const [picking, setPicking] = useState(null)
  const [name, setName] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const active = profile.modules.filter(m => !m.archived), archived = profile.modules.filter(m => m.archived)

  function start(type) {
    if (locked) return onLocked()
    if (MODULE_TYPES[type].kind === 'monthly') return onCreate(type)
    setPicking(type); setName('')
  }

  const Card = ({ m, isArchived }) => { const t = MODULE_TYPES[m.type]; const I = Icons[t.icon] || Icons.Folder; return (
    <div className={`bg-paper p-5 flex flex-col gap-3 hover:bg-paper-2 transition-colors ${isArchived ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-start"><I className="text-accent" size={20} />
        <div className="flex gap-3 text-xs">
          {t.kind !== 'monthly' || isArchived ? <button onClick={() => onArchive(m, !isArchived)} className="text-muted hover:text-ink">{isArchived ? 'Unarchive' : 'Archive'}</button> : null}
          <button onClick={() => onDelete(m)} className="text-muted hover:text-bad">Delete</button>
        </div></div>
      <div><p className="text-xs text-muted">{t.label}</p><h3 className="font-medium text-lg leading-tight">{m.name}</h3></div>
      <Button variant="outline" size="sm" className="self-start mt-auto" onClick={() => onOpen(m.id)}>Open</Button>
    </div>
  )}

  return (
    <div className="space-y-12">
      <Overview key={version} modules={profile.modules} onOpen={onOpen} onRefresh={onRefresh} refreshing={refreshing} />

      <section>
        <p className="text-xs text-muted flex items-center gap-2 mb-3"><span className="w-6 h-px bg-accent" /> Your trackers</p>
        {active.length === 0
          ? <p className="text-muted font-light">Nothing yet. Create your first tracker below — it takes 10 seconds. Or tap <b className="font-medium">Quick add</b> to log an expense; this month's tracker will be created for you.</p>
          : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink border border-ink">{active.map(m => <Card key={m.id} m={m} />)}</div>}
      </section>

      <section>
        <p className="text-xs text-muted flex items-center gap-2 mb-3"><span className="w-6 h-px bg-accent" /> Create new</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ink border border-ink">
          {Object.entries(MODULE_TYPES).map(([k, t]) => { const I = Icons[t.icon] || Icons.Folder; return (
            <button key={k} onClick={() => start(k)} className="bg-paper p-5 text-left hover:bg-paper-2 transition-colors flex flex-col gap-3">
              <I size={20} className="text-accent" /><span className="font-medium">{t.label}</span><span className="text-sm text-muted font-light">{t.desc}</span>
              <span className="text-xs mt-auto flex items-center gap-1">{locked ? <><Icons.Lock size={12} /> Unlock</> : <><Icons.Plus size={12} /> Create</>}</span>
            </button>
          )})}
        </div>
      </section>

      {archived.length > 0 && (
        <section>
          <button onClick={() => setShowArchived(s => !s)} className="text-xs text-muted flex items-center gap-2 mb-3"><span className="w-6 h-px bg-accent" /> Archived ({archived.length}) <Icons.ChevronDown size={14} className={showArchived ? 'rotate-180' : ''} /></button>
          {showArchived && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink border border-ink">{archived.map(m => <Card key={m.id} m={m} isArchived />)}</div>}
        </section>
      )}

      {picking && (
        <div className="fixed inset-0 z-50 bg-ink/60 grid place-items-center p-4" onClick={() => setPicking(null)}>
          <form className="bg-paper border border-ink max-w-md w-full p-8 space-y-4" onClick={e => e.stopPropagation()}
            onSubmit={e => { e.preventDefault(); if (name.trim()) { onCreate(picking, name.trim(), { destination: name.trim() }); setPicking(null) } }}>
            <h2 className="text-xl font-medium">{MODULE_TYPES[picking].label}</h2>
            <label className="block text-sm text-muted">{MODULE_TYPES[picking].askName || 'Give it a name'}</label>
            <Input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Type here…" />
            <div className="flex gap-2 justify-end"><Button type="button" variant="ghost" onClick={() => setPicking(null)}>Cancel</Button><Button type="submit">Create tracker</Button></div>
          </form>
        </div>
      )}
    </div>
  )
}
