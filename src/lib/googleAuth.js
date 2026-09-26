// Google Identity Services token client — gives us a Sheets/Drive access token.
// Firebase handles *who* the user is; this handles *permission* to write their Sheet.
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets'
let tokenClient, token = null, expiresAt = 0

function ready() {
  return new Promise((res) => {
    const check = () => (window.google?.accounts?.oauth2 ? res() : setTimeout(check, 100))
    check()
  })
}

export async function getAccessToken(email, interactive = true) {
  if (token && Date.now() < expiresAt - 60_000) return token
  await ready()
  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: SCOPES,
      hint: email,
      callback: (r) => {
        if (r.error) return reject(new Error(r.error))
        token = r.access_token
        expiresAt = Date.now() + (r.expires_in || 3600) * 1000
        resolve(token)
      }
    })
    tokenClient.requestAccessToken({ prompt: interactive ? '' : 'none' })
  })
}

export function clearToken() { token = null; expiresAt = 0 }
