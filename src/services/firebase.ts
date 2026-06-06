import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, deleteUser } from "firebase/auth";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";

// Initialize Firebase using Vite Env Variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error("Google Sign In Error", err);
    throw err;
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const deleteUserAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user to delete");
  
  try {
    // 1. Delete user data from Firestore
    await deleteDoc(doc(db, "users", user.uid));
    
    // 2. Delete user account from Firebase Auth
    await deleteUser(user);
  } catch (err) {
    console.error("Error deleting user account", err);
    throw err;
  }
};
