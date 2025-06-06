"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    setLoading(true);
    try {
      // First check if we have user data in client-side cookie
      const userData = Cookies.get('user');
      
      if (userData) {
        setUser(JSON.parse(userData));
        setLoading(false);
        return true;
      }

      // If no user data, verify with the server using HTTP-only cookie
      const response = await fetch('/api/auth/verify', {
        credentials: 'include', // Necessary for HTTP-only cookies
      });

      if (response.ok) {
        const data = await response.json();
        Cookies.set('user', JSON.stringify(data.user), { expires: 1 });
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth verification failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        router.push('/login');
      }
    };

    initializeAuth();
  }, []);

  const login = async (token, userData) => {
    try {
      console.log('getting token:', token);
      // Set HTTP-only cookie via API route
      const res = await fetch('/api/auth/set-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
        credentials: 'include', // Important for cookies to be set
      });
      
      if (res.ok) {
        // Store user data in client-side cookie
        Cookies.set('user', JSON.stringify(userData), { expires: 1 });
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };
  const logout = async () => {
    try {
      // Clear HTTP-only cookie via API route
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear client-side cookies and state
      Cookies.remove('user');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);