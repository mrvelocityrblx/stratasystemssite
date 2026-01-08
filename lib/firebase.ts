import { initializeApp, getApps } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAWHxbm9BYZmgf3djIvXyg5FlaPFIIxWM8",
  authDomain: "strata-systems-a8e70.firebaseapp.com",
  projectId: "strata-systems-a8e70",
  storageBucket: "strata-systems-a8e70.firebasestorage.app",
  messagingSenderId: "326258813574",
  appId: "1:326258813574:web:4174de484c72c88d61ff07",
  measurementId: "G-K2X8GPJ75Y",
}

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)

export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope("profile")
googleProvider.addScope("email")

// Note: To enable Google sign-in:
// 1. Go to Firebase Console > Authentication > Sign-in method
// 2. Enable "Google" provider
// 3. Under "Authorized domains", add: stratasystems.vercel.app
// 4. This allows OAuth redirects from your custom domain
