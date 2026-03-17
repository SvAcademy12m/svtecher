import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const AppLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  if (isDashboard) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0e1225] transition-colors duration-500">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
