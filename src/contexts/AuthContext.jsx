import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { subscribeToAuthChanges, logoutUser, getNetworkingRole } from '../core/services/authService';
import { ROLES } from '../core/utils/constants';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../core/firebase/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Write presence to Firestore when user is online
  const writePresence = useCallback(async (uid, online) => {
    if (!uid) return;
    try {
      await setDoc(doc(db, 'presence', uid), {
        online,
        lastSeen: serverTimestamp(),
        uid,
      }, { merge: true });
    } catch (_) {
      // Silently fail - presence is non-critical
    }
  }, []);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 10000);

    let snapshotUnsubscribe = null;

    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      try {
        clearTimeout(safetyTimer);
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Use onSnapshot to fix the race condition where authState resolves before setDoc completes on signup
          // Secondary fallback: if no doc after 8s, allow entry as customer
          const fallbackTimer = setTimeout(() => {
            setLoading(prevLoading => {
              if (prevLoading) {
                console.log('Recovery: Force resolving auth state without document');
                setUserData({ role: ROLES.CUSTOMER, status: 'pending_profile' });
                return false;
              }
              return false;
            });
          }, 8000);

          snapshotUnsubscribe = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
            if (docSnap.exists()) {
              clearTimeout(fallbackTimer);
              clearTimeout(safetyTimer);
              setUserData({ id: docSnap.id, ...docSnap.data() });
              setLoading(false);
            } else {
              // Wait for document creation
              console.warn('Waiting for user document to be generated...');
            }
          }, (err) => {
            console.error('Error fetching user data:', err);
            clearTimeout(fallbackTimer);
            setUserData(null);
            setLoading(false);
          });

          // Mark user as online
          writePresence(firebaseUser.uid, true);

          // Mark offline on tab close / refresh
          const handleOffline = () => writePresence(firebaseUser.uid, false);
          window.addEventListener('beforeunload', handleOffline);
          window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') writePresence(firebaseUser.uid, false);
            if (document.visibilityState === 'visible') writePresence(firebaseUser.uid, true);
          });
        } else {
          if (user?.uid) writePresence(user.uid, false);
          setUser(null);
          setUserData(null);
          setLoading(false);
          if (snapshotUnsubscribe) {
            snapshotUnsubscribe();
            snapshotUnsubscribe = null;
          }
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (snapshotUnsubscribe) snapshotUnsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      if (user?.uid) await writePresence(user.uid, false);
      await logoutUser();
      setUser(null);
      setUserData(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, [user, writePresence]);

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
    // Networking Stats
    referralCode: userData?.referralCode || null,
    referralsCount: userData?.referralsCount || 0,
    followersCount: userData?.followersCount || 0,
    followingCount: userData?.followingCount || 0,
    networkRole: userData?.referralsCount ? getNetworkingRole(userData.referralsCount) : getNetworkingRole(0),
  };

  if (loading) {
    return (
      <AuthContext.Provider value={value}>
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-[9999]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl animate-pulse">
              <span className="text-white font-black text-lg">SV</span>
            </div>
            <p className="text-sm font-bold text-gray-500 dark:text-white/50">Please wait...</p>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
