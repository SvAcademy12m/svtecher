import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { subscribeToAuthChanges, getUserData, logoutUser } from '../core/services/authService';
import { ROLES } from '../core/utils/constants';
import Spinner from '../components/ui/Spinner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timer: if authentication doesn't respond in 10 seconds, force render
    const safetyTimer = setTimeout(() => {
      if (loading) {
        console.warn('Auth handshake timed out. Forcing ready state.');
        setLoading(false);
      }
    }, 10000);

    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      clearTimeout(safetyTimer);
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const data = await getUserData(firebaseUser.uid);
          setUserData(data);
        } catch {
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setUser(null);
      setUserData(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  const value = {
    user,
    userData,
    loading,
    logout,
    isAuthenticated: !!user,
    role: userData?.role || null,
    isAdmin: userData?.role === ROLES.ADMIN,
    isStudent: userData?.role === ROLES.STUDENT,
    isJobFinder: userData?.role === ROLES.JOB_FINDER,
    isTrainer: userData?.role === ROLES.TRAINER,
    isCustomer: userData?.role === ROLES.CUSTOMER,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <Spinner fullScreen text="Establishing Secure Connection to SVTECH Node..." />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
