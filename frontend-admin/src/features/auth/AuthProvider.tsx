import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getMe, adminLogin, adminLogout } from './api';
import { getToken, setToken } from '@/lib/http';
import type { UserProfile } from '@/types';

interface AuthState {
  user: UserProfile | null;
  profile: UserProfile | null;
  role: 'customer' | 'admin' | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!getToken()) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const me = await getMe();
      if (me.role !== 'admin') {
        setToken(null);
        setProfile(null);
      } else {
        setProfile(me);
      }
    } catch {
      setToken(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user: profile, profile, role: profile?.role ?? null, loading, refresh: load }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { adminLogin, adminLogout };
