import { useState } from 'react'
import * as Icons from 'lucide-react'
import { MODULE_TYPES } from '@/data/templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { monthLabel } from '@/lib/utils'

export default function ModuleHome({ profile, onOpen, onCreate, onDelete, locked, onLocked }) {
  const [picking, setPicking] = useState(null) // type key
  const [name, setName] = useState('')

  function start(type) {
    if (locked) return onLocked()
    const t = MODULE_TYPES[type]
    if (t.kind === 'monthly') return onCreate(type, monthLabel())
    setPicking(type); setName('')
  }

  return (
    <div className="space-y-12">
      <section>
        <p className="text-xs text-neutral-500 flex items-center gap-2 mb-3"><span className="w-6 h-px bg-accent" /> Your trackers</p>
        {profile.modules.length === 0 ? (
          <p className="text-neutral-600 font-light">Nothing yet. Create your first tracker below — it takes 10 seconds.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink border border-ink">
            {profile.modules.map(m => {
              const t = MODULE_TYPES[m.type]; const I = Icons[t.icon] || Icons.Folder
              return (
                <div key={m.id} className="bg-white p-5 flex flex-col gap-3 hover:bg-paper-2 transition-colors">
                  <div className="flex justify-between items-start"><I className="text-accent" size={20} /><button onClick={() => onDelete(m)} className="text-xs text-neutral-400 hover:text-bad">Delete</button></div>
                  <div><p className="text-xs text-neutral-500">{t.label}</p><h3 className="font-medium text-lg leading-tight">{m.name}</h3></div>
                  <Button variant="outline" size="sm" className="self-start mt-auto" onClick={() => onOpen(m.id)}>Open</Button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <p className="text-xs text-neutral-500 flex items-center gap-2 mb-3"><span className="w-6 h-px bg-accent" /> Create new</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ink border border-ink">
          {Object.entries(MODULE_TYPES).map(([k, t]) => {
            const I = Icons[t.icon] || Icons.Folder
            return (
              <button key={k} onClick={() => start(k)} className="bg-white p-5 text-left hover:bg-paper-2 transition-colors flex flex-col gap-3">
                <I size={20} className="text-accent" />
                <span className="font-medium">{t.label}</span>
                <span className="text-sm text-neutral-600 font-light">{t.desc}</span>
                <span className="text-xs mt-auto flex items-center gap-1">{locked ? <><Icons.Lock size={12} /> Unlock</> : <><Icons.Plus size={12} /> Create</>}</span>
              </button>
            )
          })}
        </div>
      </section>

      {picking && (
        <div className="fixed inset-0 z-50 bg-ink/60 grid place-items-center p-4" onClick={() => setPicking(null)}>
          <form className="bg-white border border-ink max-w-md w-full p-8 space-y-4" onClick={e => e.stopPropagation()}
            onSubmit={e => { e.preventDefault(); if (name.trim()) { onCreate(picking, name.trim(), { destination: name.trim() }); setPicking(null) } }}>
            <h2 className="text-xl font-medium">{MODULE_TYPES[picking].label}</h2>
            <label className="block text-sm text-neutral-600">{MODULE_TYPES[picking].askName || 'Give it a name'}</label>
            <Input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Type here…" />
            <div className="flex gap-2 justify-end"><Button type="button" variant="ghost" onClick={() => setPicking(null)}>Cancel</Button><Button type="submit">Create tracker</Button></div>
          </form>
        </div>
      )}
    </div>
  )
}
