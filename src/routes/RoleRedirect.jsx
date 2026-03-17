import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_DASHBOARD_PATHS } from '../core/utils/constants';
import Spinner from '../components/ui/Spinner';

/** Redirect authenticated users to their role-specific dashboard */
const RoleRedirect = () => {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { replace: true });
      } else if (userData?.role) {
        const path = ROLE_DASHBOARD_PATHS[userData.role] || '/';
        navigate(path, { replace: true });
      }
    }
  }, [user, userData, loading, navigate]);

  return <Spinner fullScreen text="Redirecting to your dashboard..." />;
};

export default RoleRedirect;
