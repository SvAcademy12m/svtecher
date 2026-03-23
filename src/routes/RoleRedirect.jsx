import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_DASHBOARD_PATHS } from '../core/utils/constants';
import Spinner from '../components/ui/Spinner';

/** Redirect authenticated users to their role-specific dashboard */
const RoleRedirect = () => {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();
  const [waited, setWaited] = useState(false);

  // Give userData time to sync from Firestore before making any redirect decisions
  useEffect(() => {
    if (!loading && !userData?.role && user) {
      const timer = setTimeout(() => setWaited(true), 2000);
      return () => clearTimeout(timer);
    }
    if (!loading && !user) {
      setWaited(true);
    }
  }, [loading, userData, user]);

  useEffect(() => {
    // Don't redirect while still loading or waiting for userData
    if (loading) return;
    
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (userData?.role) {
      const path = ROLE_DASHBOARD_PATHS[userData.role] || '/';
      navigate(path, { replace: true });
      return;
    }

    // Only fallback after we've waited long enough
    if (waited) {
      navigate('/', { replace: true });
    }
  }, [user, userData, loading, navigate, waited]);

  return <Spinner fullScreen text="Syncing your dashboard..." />;
};

export default RoleRedirect;
