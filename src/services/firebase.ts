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

export const savePlannerToFirebase = async (uid: string, state: any) => {
  try {
    const dataToSave = {
      profile: state.profile || null,
      completedCourses: state.completedCourses || [],
      waivedCourses: state.waivedCourses || [],
      highlightedCourses: state.highlightedCourses || [],
      removedCoreCourses: state.removedCoreCourses || [],
      aiContext: state.aiContext || "",
      semesterPlan: state.semesterPlan || {}
    };
    await import("firebase/firestore").then(({ setDoc, doc }) => 
      setDoc(doc(db, "users", uid), { plannerData: dataToSave }, { merge: true })
    );
  } catch (err) {
    console.error("Error saving planner to Firebase:", err);
  }
};

export const loadPlannerFromFirebase = async (uid: string) => {
  try {
    const docSnap = await import("firebase/firestore").then(({ getDoc, doc }) => 
      getDoc(doc(db, "users", uid))
    );
    if (docSnap.exists()) {
      return docSnap.data().plannerData;
    }
  } catch (err) {
    console.error("Error loading planner from Firebase:", err);
  }
  return null;
};

export const fetchCloudCatalog = async (year: string, term: string) => {
  try {
    const { collection, getDocs } = await import("firebase/firestore");
    const catalogRef = collection(db, "catalog", `${year}_${term}`, "departments");
    const snapshot = await getDocs(catalogRef);
    
    if (snapshot.empty) return null;

    let allCourses: any[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.courses && Array.isArray(data.courses)) {
        allCourses = allCourses.concat(data.courses);
      }
    });
    
    return allCourses;
  } catch (err) {
    console.error("Error fetching cloud catalog:", err);
    return null;
  }
};
