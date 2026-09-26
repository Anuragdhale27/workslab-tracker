import { useState } from 'react'
import { Palette } from 'lucide-react'
import { THEMES } from '@/config'
import { Button } from '@/components/ui/button'

export default function ThemePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(o => !o)} title="Theme"><Palette size={16} /></Button>
      {open && (
        <div className="absolute right-0 top-10 z-50 bg-paper border border-ink w-56 shadow-lg" onMouseLeave={() => setOpen(false)}>
          {Object.entries(THEMES).map(([k, t]) => (
            <button key={k} onClick={() => { onChange(k); setOpen(false) }} data-theme={k}
              className={`w-full text-left px-3 py-2.5 flex items-center gap-3 border-b border-line last:border-0 hover:bg-paper-2 ${value === k ? 'bg-paper-2' : ''}`}>
              <span className="flex gap-0.5 shrink-0"><span className="w-3 h-5 bg-ink" /><span className="w-3 h-5 bg-accent" /><span className="w-3 h-5 bg-paper-2 border border-line" /></span>
              <span className="text-ink"><span className="text-sm font-medium block leading-tight">{t.label}</span><span className="text-xs text-muted">{t.hint}</span></span>
              {value === k && <span className="ml-auto text-accent text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
