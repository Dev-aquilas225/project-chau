import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getMe } from './api';
import { getToken, setToken } from '@/lib/http';
import type { CustomRole, Role, UserProfile } from '@/types';

interface AuthState {
  user: UserProfile | null;
  role: Role | null;
  customRole: CustomRole | null;
  isStaff: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  customRole: null,
  isStaff: false,
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const customRole = (user?.customRole as CustomRole | null) ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        customRole,
        isStaff: user?.role === 'admin' || !!customRole,
        loading,
        refresh: load,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
