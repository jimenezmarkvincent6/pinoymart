import { getApps, getApp, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Storage is intentionally NOT initialized — Firebase requires Blaze plan
// for Storage on new projects. Phase 2A uses emojis as product visuals;
// real images will be added via Cloudinary (free, no card) when ready.
function assertConfig() {
  const required: (keyof typeof firebaseConfig)[] = [
    "apiKey",
    "authDomain",
    "projectId",
    "appId",
  ];
  const missing = required.filter((k) => !firebaseConfig[k]);
  if (missing.length > 0) {
    throw new Error(
      `Firebase config missing values: ${missing.join(", ")}. ` +
        `Add them to .env.local — see .env.local.example.`
    );
  }
}

let app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;

export function firebaseApp(): FirebaseApp {
  if (app) return app;
  assertConfig();
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export function firebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(firebaseApp());
  return _auth;
}

export function firebaseDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(firebaseApp());
  return _db;
}
