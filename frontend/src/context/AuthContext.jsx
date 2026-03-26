import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hireai_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const signIn = (userData, token) => {
    localStorage.setItem('hireai_token', token);
    localStorage.setItem('hireai_user', JSON.stringify(userData));
    setUser(userData);
  };

  const signOut = () => {
    localStorage.removeItem('hireai_token');
    localStorage.removeItem('hireai_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
