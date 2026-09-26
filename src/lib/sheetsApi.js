// Google Sheets + Drive REST wrapper. All data lives in the user's own Drive.
import { getAccessToken } from './googleAuth'

export const MASTER_TITLE = 'Workslab Budget Ecosystem'
const SHEETS = 'https://sheets.googleapis.com/v4/spreadsheets'
const DRIVE = 'https://www.googleapis.com/drive/v3/files'

let email = null
export const setSheetsUser = (e) => { email = e }

async function call(url, opts = {}) {
  const t = await getAccessToken(email)
  const r = await fetch(url, { ...opts, headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json', ...(opts.headers || {}) } })
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message || `${r.status} ${r.statusText}`) }
  return r.status === 204 ? null : r.json()
}

// Find or create the master spreadsheet (drive.file scope only sees files this app created)
export async function ensureMaster(knownId) {
  if (knownId) {
    try { await call(`${SHEETS}/${knownId}?fields=spreadsheetId`); return knownId } catch { /* deleted → recreate */ }
  }
  const q = encodeURIComponent(`name='${MASTER_TITLE}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`)
  const found = await call(`${DRIVE}?q=${q}&fields=files(id)`)
  if (found.files?.length) return found.files[0].id
  const created = await call(SHEETS, {
    method: 'POST',
    body: JSON.stringify({ properties: { title: MASTER_TITLE, locale: 'en_IN' }, sheets: [{ properties: { title: 'Welcome' } }] })
  })
  await writeRange(created.spreadsheetId, 'Welcome!A1', [
    ['Workslab Budget Ecosystem'], ['This file is managed by tracker.workslab.in'], ['Each tab is one tracker module. Edit here or in the app — both stay in sync.']
  ])
  return created.spreadsheetId
}

export async function listTabs(id) {
  const d = await call(`${SHEETS}/${id}?fields=sheets.properties`)
  return d.sheets.map(s => s.properties.title)
}

export async function addTab(id, title) {
  const tabs = await listTabs(id)
  if (tabs.includes(title)) return title
  await call(`${SHEETS}/${id}:batchUpdate`, { method: 'POST', body: JSON.stringify({ requests: [{ addSheet: { properties: { title } } }] }) })
  return title
}

export async function deleteTab(id, title) {
  const d = await call(`${SHEETS}/${id}?fields=sheets.properties`)
  const s = d.sheets.find(x => x.properties.title === title)
  if (s) await call(`${SHEETS}/${id}:batchUpdate`, { method: 'POST', body: JSON.stringify({ requests: [{ deleteSheet: { sheetId: s.properties.sheetId } }] }) })
}

export async function readRange(id, range) {
  const d = await call(`${SHEETS}/${id}/values/${encodeURIComponent(range)}`)
  return d.values || []
}

export async function writeRange(id, range, values) {
  return call(`${SHEETS}/${id}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, { method: 'PUT', body: JSON.stringify({ values }) })
}

// Replace a whole tab's contents with a 2-D array (header row + data rows)
export async function writeTab(id, tab, rows) {
  await call(`${SHEETS}/${id}/values/${encodeURIComponent(tab + '!A1:Z1000')}:clear`, { method: 'POST' })
  if (rows.length) await writeRange(id, `${tab}!A1`, rows)
}

export const sheetUrl = (id, tab) => `https://docs.google.com/spreadsheets/d/${id}/edit${tab ? '#gid=0' : ''}`
