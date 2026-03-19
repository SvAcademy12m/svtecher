import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import { useAuth } from '../../contexts/AuthContext';

const AppLayout = () => {
  const location = useLocation();
  const { userData } = useAuth();
  
  // Flag to check if we are on the admin control panel
  const isAdminDashboard = location.pathname.startsWith('/dashboard/admin');

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0e1225] transition-colors duration-500 pb-24 sm:pb-0">
      {/* Hide global nav for admin workspace for a focused management experience */}
      {!isAdminDashboard && <Navbar />}
      
      <main className="flex-1">
        <Outlet />
      </main>

      {!isAdminDashboard && (
        <>
          <Footer />
          <MobileBottomNav />
        </>
      )}
    </div>
  );
};

export default AppLayout;
