import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Check if we have at least an API key to attempt initialization
const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10;

let app: FirebaseApp | undefined;
let authInstance: Auth | any;
let dbInstance: Firestore | any;
let storageInstance: FirebaseStorage | any;

if (hasValidConfig) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    storageInstance = getStorage(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    setupMocks();
  }
} else {
  console.warn("Firebase configuration missing. Operating in Mock Mode.");
  setupMocks();
}

function setupMocks() {
  // Minimal mocks to prevent UI crashes in component logic
  authInstance = {
    onAuthStateChanged: (callback: (user: any) => void) => {
      // Simulate a logged-out state by default
      callback(null);
      return () => {};
    },
    currentUser: null,
  };

  dbInstance = {
    // Return empty observables for snapshots
    collection: () => ({
      doc: () => ({}),
    }),
  };

  storageInstance = {};
}

export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
