import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiHome, HiShoppingCart, HiGlobe, HiLogout, HiMenu, HiX, HiDownload, HiClipboardList } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { logoutUser } from '../../core/services/authService';
import { getInitials } from '../../core/utils/formatters';

const CustomerDashboard = () => {
  const [activePanel, setActivePanel] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { userData, user } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const navSections = [
    {
      items: [
        { key: 'overview', label: 'Overview', icon: HiHome },
        { key: 'my-purchases', label: 'My Purchases', icon: HiShoppingCart },
      ]
    },
    {
      title: 'SERVICES',
      items: [
        { key: 'web-apps', label: 'Apps & Websites', icon: HiGlobe },
        { key: 'transactions', label: 'Invoices', icon: HiClipboardList },
      ]
    }
  ];

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  const SidebarContent = ({ onNavClick }) => (
    <div className="flex flex-col h-full bg-[#0e1225]" style={{ background: 'linear-gradient(180deg, #0e1225 0%, #101c18 50%, #0e1225 100%)' }}>
      <div className="p-4 pb-3 flex items-center gap-3 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <span className="text-white font-black text-xs">SV</span>
        </div>
        <div>
          <h1 className="text-sm font-black text-white tracking-tight">Customer Portal</h1>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto w-[240px]">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-5' : ''}>
            {section.title && (
              <p className="px-3 mb-1.5 text-[10px] font-black text-emerald-300/60 uppercase tracking-[0.2em]">{section.title}</p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => (
                <button
                  key={item.key}
                  onClick={() => { setActivePanel(item.key); onNavClick?.(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    activePanel === item.key ? 'bg-emerald-500/20 text-white border border-emerald-400/20 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${activePanel === item.key ? 'text-emerald-400' : ''}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-[9px] font-bold">
            {getInitials(userData?.name)}
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-bold text-white truncate">{userData?.name}</p>
            <p className="text-[9px] text-slate-500 truncate">Customer</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors" title="Sign Out">
          <HiLogout className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="hidden lg:flex w-[240px] flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-64 flex flex-col shadow-2xl">
            <button onClick={() => setMobileSidebarOpen(false)} className="absolute top-3 right-3 p-2 rounded-lg text-slate-400 hover:text-white z-10">
              <HiX className="w-5 h-5" />
            </button>
            <SidebarContent onNavClick={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-100 px-4 lg:px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <HiMenu className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-800 capitalize">{activePanel.replace('-', ' ')}</h2>
          </div>
          <button onClick={() => navigate('/services')} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-xs font-bold text-emerald-600 hover:bg-emerald-100 transition-colors">
             <HiGlobe className="w-4 h-4" /> Request Service
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50">
          {activePanel === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-900">Welcome, {userData?.name?.split(' ')[0]}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-lg stat-shine">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                    <HiShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-3xl font-black">0</p>
                  <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider mt-1">Digital Products</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
                    <HiGlobe className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-3xl font-black text-slate-900">0</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active Projects</p>
                </div>
              </div>

              <div className="mt-8 text-center py-16 bg-white rounded-2xl border border-slate-100">
                <HiShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500 mb-4">You have no purchases or active orders yet.</p>
                <button onClick={() => navigate('/services')} className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all">
                  Browse Services
                </button>
              </div>
            </div>
          )}
          {activePanel !== 'overview' && (
             <div className="flex items-center justify-center h-full text-center">
               <div>
                  <h3 className="text-xl font-bold text-slate-900">{activePanel.replace('-', ' ')}</h3>
                  <p className="text-sm text-slate-500 mt-2">Section under construction.</p>
               </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;
