import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hiresmart_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const signIn = (userData, token) => {
    localStorage.setItem('hiresmart_token', token);
    localStorage.setItem('hiresmart_user', JSON.stringify(userData));
    setUser(userData);
  };

  const signOut = () => {
    localStorage.removeItem('hiresmart_token');
    localStorage.removeItem('hiresmart_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
