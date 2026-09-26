import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc, updateDoc, runTransaction, onSnapshot } from 'firebase/firestore'
import { PRICING, DEFAULT_THEME } from '@/config'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
})
export const auth = getAuth(app)
export const db = getFirestore(app)

export const signIn = () => signInWithPopup(auth, new GoogleAuthProvider())
export const signOut = () => fbSignOut(auth)
export const watchAuth = (cb) => onAuthStateChanged(auth, cb)

// ---- Public stats (seat counter shown on landing page) ----
export const watchStats = (cb) => onSnapshot(doc(db, 'meta', 'stats'), s => cb(s.exists() ? s.data() : { userCount: 0 }), () => cb({ userCount: 0 }))

// ---- Profile ----
// plan: 'founder' (first 100 users, free forever) | 'paid' | 'free' (trial)
const defaults = { modules: [], plan: 'free', userNumber: null, theme: DEFAULT_THEME, spreadsheetId: null }

export async function loadProfile(uid) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return { ...defaults, ...snap.data() }
  // First login: claim a seat number atomically
  return runTransaction(db, async (tx) => {
    const statsRef = doc(db, 'meta', 'stats')
    const stats = await tx.get(statsRef)
    const count = (stats.exists() ? stats.data().userCount : 0) + 1
    const profile = { ...defaults, userNumber: count, plan: count <= PRICING.FOUNDER_SEATS ? 'founder' : 'free', createdAt: Date.now() }
    tx.set(statsRef, { userCount: count }, { merge: true })
    tx.set(ref, profile)
    return profile
  })
}

export const saveProfile = (uid, data) => updateDoc(doc(db, 'users', uid), data)

export const hasFullAccess = (p) => p.plan === 'founder' || p.plan === 'paid'
export const canCreateModule = (p) => hasFullAccess(p) || p.modules.filter(m => !m.archived).length < PRICING.FREE_TRIAL_MODULES
