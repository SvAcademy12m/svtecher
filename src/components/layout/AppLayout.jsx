import React, { useEffect } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileFooter from './MobileFooter';
import MobileBottomNav from './MobileBottomNav';
import AIAssistant from '../ui/AIAssistant';
import { useAuth } from '../../contexts/AuthContext';

const AppLayout = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { userData } = useAuth();
  
  // Intercept ?ref= from any endpoint and store for 5 days
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      const expiry = new Date().getTime() + 5 * 24 * 60 * 60 * 1000;
      localStorage.setItem('svtech_referral', JSON.stringify({ code: refCode, expiry }));
    }
  }, [searchParams]);

  // Flag to check if we are in a dashboard environment for isolation
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0e1225] transition-colors duration-500 pb-24 sm:pb-0">
      {/* Hide global nav for dashboard workspaces for a focused experience */}
      {!isDashboard && <Navbar />}
      
      <main className="flex-1">
        <Outlet />
      </main>

      {!isDashboard && (
        <>
          <Footer />
          <MobileFooter />
          <MobileBottomNav />
          <AIAssistant />
        </>
      )}
    </div>
  );
};

export default AppLayout;
