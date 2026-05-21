"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { firebaseAuth, firebaseDb } from "./client";
import { COL, type AdminDoc } from "./schema";

interface AuthState {
  /** Firebase Auth user (null = signed out, undefined = still loading). */
  user: User | null | undefined;
  /** Mirror of the admins/{uid} doc — null when user has no admin entry. */
  admin: AdminDoc | null | undefined;
  /** True once the initial auth + admin lookup has completed. */
  ready: boolean;
  isSuperAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [admin, setAdmin] = useState<AdminDoc | null | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const auth = firebaseAuth();
    const unsub = onAuthStateChanged(auth, async (next) => {
      setUser(next);
      if (!next) {
        setAdmin(null);
        setReady(true);
        return;
      }
      try {
        const snap = await getDoc(doc(firebaseDb(), COL.admins, next.uid));
        setAdmin(snap.exists() ? (snap.data() as AdminDoc) : null);
      } catch (err) {
        console.error("Failed to load admin doc:", err);
        setAdmin(null);
      } finally {
        setReady(true);
      }
    });
    return () => unsub();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(firebaseAuth(), email, password);
    // onAuthStateChanged will populate state on success.
  };

  const signOut = async () => {
    await fbSignOut(firebaseAuth());
  };

  const value: AuthState = {
    user,
    admin,
    ready,
    isSuperAdmin: admin?.role === "super",
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
