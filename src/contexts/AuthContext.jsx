import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToAuthChanges, getUserData } from '../core/services/authService';
import { ROLES } from '../core/utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      setLoading(true);
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
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
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
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
