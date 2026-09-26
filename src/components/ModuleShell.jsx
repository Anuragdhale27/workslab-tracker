// Shared: header, sync status, export, share help. Wraps every module.
import { useState } from 'react'
import { ArrowLeft, Download, Share2, ExternalLink, Check, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sheetUrl } from '@/lib/sheetsApi'

export default function ModuleShell({ mod, spreadsheetId, onBack, status, onExport, hero, children }) {
  const [share, setShare] = useState(false)
  return (
    <div className="space-y-6">
      {hero && (
        <div className="relative h-40 sm:h-56 border border-ink overflow-hidden bg-ink">
          <img src={hero} alt="" className="w-full h-full object-cover opacity-80" onError={e => (e.target.style.display = 'none')} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
          <h1 className="absolute bottom-4 left-5 text-white text-3xl sm:text-5xl font-medium tracking-tight">{mod.name}</h1>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft size={18} /></Button>
          {!hero && <h1 className="text-2xl sm:text-3xl font-medium tracking-tight">{mod.name}</h1>}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`flex items-center gap-1 ${status === 'saved' ? 'text-ok' : 'text-neutral-500'}`}>
            {status === 'saving' ? <><RefreshCw size={12} className="animate-spin" /> Syncing to Sheet</> : status === 'saved' ? <><Check size={12} /> Synced</> : status === 'offline' ? 'Offline — queued' : status === 'loading' ? 'Loading…' : ''}
          </span>
          <Button variant="outline" size="sm" onClick={onExport}><Download size={14} /> CSV</Button>
          <Button variant="outline" size="sm" onClick={() => setShare(s => !s)}><Share2 size={14} /> Share</Button>
          {spreadsheetId && <a href={sheetUrl(spreadsheetId)} target="_blank" rel="noopener"><Button size="sm"><ExternalLink size={14} /> Sheet</Button></a>}
        </div>
      </div>
      {share && (
        <div className="border border-ink p-5 text-sm bg-paper-2 space-y-2">
          <p className="font-medium">Share this tracker read-only</p>
          <ol className="list-decimal ml-5 space-y-1 text-neutral-700 font-light">
            <li>Click <b className="font-medium">Sheet</b> above to open your Google Sheet.</li>
            <li>Top-right, click <b className="font-medium">Share</b> → add their email (or "Anyone with the link").</li>
            <li>Set permission to <b className="font-medium">Viewer</b>. They see live numbers but can't edit.</li>
          </ol>
          <p className="text-xs text-neutral-500">Tip: the tab for this tracker is named "{mod.tab}".</p>
        </div>
      )}
      {children}
    </div>
  )
}
