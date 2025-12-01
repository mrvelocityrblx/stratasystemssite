// Global Firestore store for cross-device data (credentials, bans)
import { db } from "./firebase"
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where } from "firebase/firestore"

export interface GlobalCredential {
  email: string
  password: string
  createdAt: string
}

export interface GlobalBan {
  email: string
  bannedAt: string
  bannedBy: string
}

export interface GlobalUser {
  uid: string
  email: string
  displayName: string
  createdAt: string
  plan: "free" | "starter" | "pro"
  subscriptionEnd?: string | null
  banned?: boolean
  corporateRole?: string | null
  customGenerationLimit?: number
}

// ===== CREDENTIALS =====
export async function saveGlobalCredential(email: string, password: string): Promise<void> {
  try {
    const docRef = doc(db, "credentials", email.toLowerCase())
    await setDoc(docRef, {
      email: email.toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error saving credential:", error)
  }
}

export async function getGlobalCredentials(): Promise<GlobalCredential[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "credentials"))
    const credentials: GlobalCredential[] = []
    querySnapshot.forEach((doc) => {
      credentials.push(doc.data() as GlobalCredential)
    })
    return credentials.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Error getting credentials:", error)
    return []
  }
}

export async function getGlobalCredentialByEmail(email: string): Promise<GlobalCredential | null> {
  try {
    const docRef = doc(db, "credentials", email.toLowerCase())
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data() as GlobalCredential
    }
    return null
  } catch (error) {
    console.error("Error getting credential:", error)
    return null
  }
}

// ===== BANS =====
export async function addGlobalBan(email: string, bannedBy: string): Promise<void> {
  try {
    const docRef = doc(db, "bans", email.toLowerCase())
    await setDoc(docRef, {
      email: email.toLowerCase(),
      bannedAt: new Date().toISOString(),
      bannedBy,
    })
    // Also update user document if exists
    const userQuery = query(collection(db, "users"), where("email", "==", email.toLowerCase()))
    const userSnapshot = await getDocs(userQuery)
    userSnapshot.forEach(async (userDoc) => {
      await setDoc(doc(db, "users", userDoc.id), { ...userDoc.data(), banned: true }, { merge: true })
    })
  } catch (error) {
    console.error("Error adding ban:", error)
  }
}

export async function removeGlobalBan(email: string): Promise<void> {
  try {
    const docRef = doc(db, "bans", email.toLowerCase())
    await deleteDoc(docRef)
    // Also update user document if exists
    const userQuery = query(collection(db, "users"), where("email", "==", email.toLowerCase()))
    const userSnapshot = await getDocs(userQuery)
    userSnapshot.forEach(async (userDoc) => {
      await setDoc(doc(db, "users", userDoc.id), { ...userDoc.data(), banned: false }, { merge: true })
    })
  } catch (error) {
    console.error("Error removing ban:", error)
  }
}

export async function getGlobalBans(): Promise<GlobalBan[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "bans"))
    const bans: GlobalBan[] = []
    querySnapshot.forEach((doc) => {
      bans.push(doc.data() as GlobalBan)
    })
    return bans
  } catch (error) {
    console.error("Error getting bans:", error)
    return []
  }
}

export async function isGloballyBanned(email: string): Promise<boolean> {
  try {
    const docRef = doc(db, "bans", email.toLowerCase())
    const docSnap = await getDoc(docRef)
    return docSnap.exists()
  } catch (error) {
    console.error("Error checking ban:", error)
    return false
  }
}

// ===== USERS =====
export async function saveGlobalUser(user: GlobalUser): Promise<void> {
  try {
    const docRef = doc(db, "users", user.uid)
    await setDoc(
      docRef,
      {
        ...user,
        email: user.email.toLowerCase(),
      },
      { merge: true },
    )
  } catch (error) {
    console.error("Error saving user:", error)
  }
}

export async function getGlobalUsers(): Promise<GlobalUser[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "users"))
    const users: GlobalUser[] = []
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as GlobalUser)
    })
    return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Error getting users:", error)
    return []
  }
}

export async function getGlobalUserByEmail(email: string): Promise<GlobalUser | null> {
  try {
    const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as GlobalUser
    }
    return null
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

export async function deleteGlobalUser(uid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "users", uid))
  } catch (error) {
    console.error("Error deleting user:", error)
  }
}

export async function updateGlobalUserPlan(
  email: string,
  plan: "free" | "starter" | "pro",
  subscriptionEnd?: string | null,
): Promise<void> {
  try {
    const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(async (userDoc) => {
      await setDoc(
        doc(db, "users", userDoc.id),
        {
          ...userDoc.data(),
          plan,
          subscriptionEnd: subscriptionEnd || null,
        },
        { merge: true },
      )
    })
  } catch (error) {
    console.error("Error updating user plan:", error)
  }
}

export async function updateGlobalUserGenerationLimit(email: string, limit: number): Promise<void> {
  try {
    const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(async (userDoc) => {
      await setDoc(
        doc(db, "users", userDoc.id),
        {
          ...userDoc.data(),
          customGenerationLimit: limit,
        },
        { merge: true },
      )
    })
  } catch (error) {
    console.error("Error updating generation limit:", error)
  }
}

export async function updateGlobalUserRole(email: string, role: string | null): Promise<void> {
  try {
    const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(async (userDoc) => {
      await setDoc(
        doc(db, "users", userDoc.id),
        {
          ...userDoc.data(),
          corporateRole: role,
        },
        { merge: true },
      )
    })
  } catch (error) {
    console.error("Error updating user role:", error)
  }
}
