import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

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

// ---- User profile: quota + module registry (Firestore) ----
export const FREE_MODULES = 100

const defaults = { modules: [], moduleCount: 0, paid: false, spreadsheetId: null }

export async function loadProfile(uid) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) { await setDoc(ref, { ...defaults, createdAt: Date.now() }); return { ...defaults } }
  return { ...defaults, ...snap.data() }
}

export const saveProfile = (uid, data) => updateDoc(doc(db, 'users', uid), data)

export const canCreateModule = (p) => p.paid || p.moduleCount < FREE_MODULES
