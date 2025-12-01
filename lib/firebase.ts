import { initializeApp, getApps } from "firebase/app"
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAqEyMje0YhR0F213t9kYvvfTDkEruayKc",
  authDomain: "strata-systems.firebaseapp.com",
  projectId: "strata-systems",
  storageBucket: "strata-systems.firebasestorage.app",
  messagingSenderId: "507410632496",
  appId: "1:507410632496:web:29228b67df58e220de82f5",
  measurementId: "G-DH22ZL0ZPJ",
}

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
export const discordProvider = new OAuthProvider("oidc.discord")
