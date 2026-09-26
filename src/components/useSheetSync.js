// Hook: load module data from Sheet (with cache fallback), debounce-save on change, queue when offline.
import { useEffect, useRef, useState, useCallback } from 'react'
import { readRange, writeTab } from '@/lib/sheetsApi'
import { cacheGet, cacheSet, queuePush, queueDrain } from '@/lib/storage'
import { toRows, fromRows } from '@/data/templates'

export function useSheetSync({ mod, kind, spreadsheetId, seed, setErr }) {
  const key = `mod:${mod.id}`
  const [data, setData] = useState(() => cacheGet(key) ?? seed)
  const [status, setStatus] = useState('loading')
  const timer = useRef()

  // initial load from Sheet
  useEffect(() => {
    let live = true
    ;(async () => {
      if (!spreadsheetId || !navigator.onLine) { setStatus(navigator.onLine ? '' : 'offline'); return }
      try {
        const rows = await readRange(spreadsheetId, `${mod.tab}!A1:D1000`)
        if (live && rows.length > 1) { const d = fromRows(kind, rows); setData(d); cacheSet(key, d) }
        if (live) setStatus('saved')
      } catch (e) { if (live) { setStatus(''); setErr?.('Could not read sheet: ' + e.message) } }
    })()
    return () => { live = false }
  }, [spreadsheetId, mod.tab])

  // flush offline queue when back online
  useEffect(() => {
    const flush = async () => {
      for (const job of queueDrain()) { try { await writeTab(job.sid, job.tab, job.rows) } catch { queuePush(job) } }
      setStatus('saved')
    }
    window.addEventListener('online', flush)
    return () => window.removeEventListener('online', flush)
  }, [])

  const update = useCallback((next) => {
    setData(next); cacheSet(key, next)
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const rows = toRows(kind, next)
      if (!navigator.onLine || !spreadsheetId) { queuePush({ sid: spreadsheetId, tab: mod.tab, rows }); setStatus('offline'); return }
      setStatus('saving')
      try { await writeTab(spreadsheetId, mod.tab, rows); setStatus('saved') }
      catch (e) { setStatus(''); setErr?.('Sync failed: ' + e.message); queuePush({ sid: spreadsheetId, tab: mod.tab, rows }) }
    }, 800)
  }, [kind, spreadsheetId, mod.tab])

  return { data, update, status }
}
