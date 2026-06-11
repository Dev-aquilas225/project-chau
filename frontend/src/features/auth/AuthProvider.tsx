import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  role: 'customer' | 'admin' | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, profile: null, role: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      unsubProfile?.();
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      // Écoute temps réel du profil (rôle, adresses…)
      unsubProfile = onSnapshot(
        doc(db, 'users', u.uid),
        (snap) => {
          setProfile(snap.exists() ? ({ uid: u.uid, ...snap.data() } as UserProfile) : null);
          setLoading(false);
        },
        () => setLoading(false),
      );
    });

    return () => {
      unsubProfile?.();
      unsubAuth();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, role: profile?.role ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
