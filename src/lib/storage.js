// localStorage cache: view offline, sync when online.
const K = 'wl_tracker_cache'
const read = () => { try { return JSON.parse(localStorage.getItem(K)) || {} } catch { return {} } }
const write = (o) => localStorage.setItem(K, JSON.stringify(o))

export const cacheGet = (key) => read()[key]
export const cacheSet = (key, val) => { const o = read(); o[key] = val; write(o) }
export const cacheClear = () => localStorage.removeItem(K)

// Pending writes queue for offline mode
const Q = 'wl_tracker_queue'
export const queuePush = (job) => { const q = JSON.parse(localStorage.getItem(Q) || '[]'); q.push(job); localStorage.setItem(Q, JSON.stringify(q)) }
export const queueDrain = () => { const q = JSON.parse(localStorage.getItem(Q) || '[]'); localStorage.removeItem(Q); return q }
