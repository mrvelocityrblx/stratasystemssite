import { initializeApp, getApps } from "firebase/app"
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth"
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

export const discordProvider = new OAuthProvider("oidc.discord")
discordProvider.setCustomParameters({
  prompt: "consent",
})

// Note: To enable Google and Discord sign-in:
// 1. Go to Firebase Console > Authentication > Sign-in method
// 2. Enable "Google" provider
// 3. Enable "OpenID Connect (OIDC)" provider for Discord
//    - Provider name: Discord
//    - Client ID: (Get from Discord Developer Portal)
//    - Client secret: (Get from Discord Developer Portal)
//    - Issuer: https://discord.com
// 4. Under "Authorized domains", add: stratasystems.vercel.app
// 5. This allows OAuth redirects from your custom domain
