import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { API_URL } from '../config/constants';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('🔄 Checking auth status...');
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include', // Assure l'envoi des cookies de session
        });

        console.log('🔁 /auth/me response status:', response.status);

        if (!response.ok) {
          throw new Error(`Not authenticated (${response.status})`);
        }

        const data = await response.json();
        console.log('✅ User data:', data);
        setUser(data);
      } catch (err: any) {
        console.error('❌ Error fetching user info:', err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 🔐 Fonction login
  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    console.log('🚪 Attempting login...');
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      console.log('🧾 Login response status:', response.status);

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(`Login failed: ${errMsg}`);
      }

      const data = await response.json();
      console.log('✅ Login success. User:', data);
      setUser(data);
    } catch (err: any) {
      console.error('❌ Login error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Fonction logout
  const logout = async () => {
    console.log('🚪 Logging out...');
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (err: any) {
      console.error('❌ Logout error:', err.message);
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
