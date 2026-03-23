import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiHome, HiShoppingCart, HiGlobe, HiLogout, HiMenu, HiX, 
  HiDownload, HiClipboardList, HiTranslate, HiCurrencyDollar, 
  HiMoon, HiSun, HiSearch, HiCog
} from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTheme } from '../../contexts/ThemeContext';
import { logoutUser } from '../../core/services/authService';
import { getInitials } from '../../core/utils/formatters';
import SocialEarningsCard from '../../components/cards/SocialEarningsCard';

const CustomerDashboard = () => {
  const [activePanel, setActivePanel] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { userData, user } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const { currency, toggleCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navSections = [
    {
      title: 'Marketplace',
      items: [
        { key: 'overview', label: 'Dashboard', icon: HiHome },
        { key: 'my-purchases', label: 'My Purchases', icon: HiShoppingCart },
        { key: 'referrals', label: 'Referrals', icon: HiGlobe },
      ]
    },
    {
      title: 'Services',
      items: [
        { key: 'web-apps', label: 'My Projects', icon: HiGlobe },
        { key: 'transactions', label: 'Transactions', icon: HiClipboardList },
      ]
    }
  ];

  const getPanelLabel = () => {
    return navSections.flatMap(s => s.items).find(i => i.key === activePanel)?.label || 'Dashboard';
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  const SidebarContent = ({ onNavClick }) => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-8 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl rotate-3 transform transition-transform group-hover:rotate-0">
            <span className="text-blue-700 font-black text-xl">SV</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none text-white">Market</h1>
            <p className="text-[10px] font-black text-blue-200 tracking-widest mt-1 uppercase">Customer Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 overflow-y-auto dark-scroll">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-12' : ''}>
            <h3 className="px-5 text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] mb-4 opacity-50">{section.title}</h3>
            <div className="space-y-2">
              {section.items.map(item => (
                <button
                  key={item.key}
                  onClick={() => { setActivePanel(item.key); onNavClick?.(); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-sm tracking-tight ${
                    activePanel === item.key
                      ? 'bg-white/20 text-white shadow-xl border border-white/20 backdrop-blur-md'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform ${activePanel === item.key ? 'scale-110' : ''}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-white/10 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-rose-900/40 hover:bg-rose-600 transition-all active:scale-95 group mb-6"
        >
          <HiLogout className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Sign Out
        </button>

        <div className="p-2 bg-white/10 rounded-2xl border border-white/20 flex items-center gap-4 pr-6">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-700 font-black shadow-lg shadow-blue-900/20">
            {getInitials(userData?.name)}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs font-black text-white leading-none truncate max-w-[100px]">{userData?.name || 'Client'}</p>
            <p className="text-[9px] font-black text-blue-200 tracking-wider mt-1 opacity-60 uppercase">Verified Authority</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-[#080b18] font-sans">
      {/* ═══ TOP NAVBAR (Full Width) ═══ */}
      <header className="h-20 bg-gradient-to-r from-blue-700 to-indigo-800 text-white shrink-0 z-50 border-b border-white/10 shadow-xl flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-blue-800 font-black text-lg">SV</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black tracking-tight leading-none uppercase">SVTECHER</h1>
              <p className="text-[8px] font-bold text-blue-300 tracking-widest mt-1 uppercase opacity-70">Market Portal</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
             <h2 className="text-sm font-black text-white uppercase tracking-tighter truncate max-w-[200px]">{getPanelLabel()}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-6">
          <div className="hidden md:flex items-center gap-2 p-1 bg-white/10 rounded-2xl border border-white/20">
            <button onClick={toggleLanguage} className="p-2.5 rounded-xl hover:bg-white/20 text-white transition-all relative">
              <HiTranslate className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-rose-500 rounded-full text-[8px] font-black">{lang}</span>
            </button>
            <button onClick={toggleCurrency} className="p-2.5 rounded-xl hover:bg-white/20 text-white transition-all">
              <HiCurrencyDollar className="w-5 h-5" />
            </button>
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white/20 text-white transition-all">
              {theme === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-3 p-1 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
            <div className="hidden sm:block text-right pl-3 pr-1">
              <p className="text-xs font-black text-white leading-none">{userData?.name || 'Customer'}</p>
              <p className="text-[8px] font-black text-blue-300 tracking-widest mt-1.5 opacity-70 uppercase tracking-widest">Verified Multi-Buyer</p>
            </div>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-700 font-black shadow-lg">
              {getInitials(userData?.name)}
            </div>
          </div>
          
          <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2.5 bg-white/10 rounded-xl text-white">
            <HiMenu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-[#0e1225] border-r border-gray-200 dark:border-white/5 shadow-2xl z-40 overflow-hidden">
           <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] flex">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileSidebarOpen(false)} />
            <div className="relative w-[280px] h-full bg-white dark:bg-[#0e1225] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-300">
              <button 
                onClick={() => setMobileSidebarOpen(false)} 
                className="absolute top-5 -right-12 w-10 h-10 flex items-center justify-center rounded-xl text-white bg-blue-600 z-50 shadow-xl"
              >
                <HiX className="w-6 h-6" />
              </button>
              <SidebarContent onNavClick={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
           <main className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scroll bg-[#f8fafc] dark:bg-[#080b18]">
              <div className="max-w-[1600px] mx-auto min-h-full">
                {activePanel === 'overview' && (
                  <div className="space-y-10 animate-in fade-in duration-700">
                     <div>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 uppercase">Market Dashboard</h3>
                        <p className="text-[10px] font-black text-slate-500 dark:text-white/40 tracking-[0.3em] uppercase">Control Matrix Level 1</p>
                     </div>

                     {(() => {
                        const referralCount = userData?.referralsCount || 0;
                        const finalEtb = referralCount > 0 ? (20 + (referralCount - 1) * 10) : 0;
                        const finalUsd = (finalEtb / 120).toFixed(2);
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                             <StatCard label="My Purchases" val="0" icon={HiShoppingCart} color="from-blue-600 to-indigo-700" />
                             <StatCard label="My Projects" val="0" icon={HiGlobe} color="from-indigo-600 to-blue-800" />
                             <StatCard label="Followers" val={userData?.followersCount || 0} icon={HiGlobe} color="from-emerald-500 to-teal-600" />
                             <StatCard label="Wallet" val={`${userData?.walletBalance || 0} Br`} icon={HiGlobe} color="from-purple-600 to-indigo-700" />
                          </div>
                        );
                     })()}

                     {/* Social Media Daily Earnings */}
                     <SocialEarningsCard userId={user?.uid} />

                     <div className="mt-12 text-center py-24 bg-white dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/10 shadow-inner">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                          <HiShoppingCart className="w-10 h-10 text-slate-300 dark:text-white/20" />
                        </div>
                        <p className="text-lg font-black text-slate-500 dark:text-white/40 uppercase tracking-widest mb-6">No purchases found.</p>
                        <button onClick={() => navigate('/services')} className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all">
                          Go to Shop
                        </button>
                     </div>
                  </div>
                )}
                {activePanel !== 'overview' && (
                   <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                      <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse">
                         <HiCog className="w-12 h-12 text-slate-300 dark:text-white/20" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3">{activePanel.replace('-', ' ')}</h3>
                      <p className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">System implementation in progress...</p>
                   </div>
                )}
              </div>
           </main>
        </div>
      </div>

      {/* MOBILE TAB BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/95 dark:bg-[#0e1225]/95 backdrop-blur-3xl border-t border-slate-200 dark:border-white/10 px-6 py-2 flex items-center justify-between pb-safe shadow-2xl">
        <MobileNavItem active={activePanel === 'overview'} icon={HiHome} onClick={() => setActivePanel('overview')} />
        <MobileNavItem active={activePanel === 'my-purchases'} icon={HiShoppingCart} onClick={() => setActivePanel('my-purchases')} />
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="w-14 h-14 -mt-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-2xl border-4 border-white dark:border-[#0e1225]"
        >
          <HiMenu className="w-8 h-8" />
        </button>
        <MobileNavItem active={activePanel === 'web-apps'} icon={HiGlobe} onClick={() => setActivePanel('web-apps')} />
        <MobileNavItem active={activePanel === 'transactions'} icon={HiClipboardList} onClick={() => setActivePanel('transactions')} />
      </nav>
    </div>
  );
};

const MobileNavItem = ({ active, icon: Icon, onClick }) => (
  <button onClick={onClick} className={`p-2 rounded-xl transition-all ${active ? 'bg-blue-600/10 text-blue-600' : 'text-slate-400'}`}>
    <Icon className="w-6 h-6" />
  </button>
);

export default CustomerDashboard;

const StatCard = ({ label, val, subVal, icon: Icon, color }) => (
  <div className={`bg-gradient-to-br ${color} p-8 rounded-[2.5rem] text-white relative overflow-hidden group border border-white/10 shadow-xl`}>
     <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
        <Icon className="w-24 h-24" />
     </div>
     <div className="relative z-10">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/20">
           <Icon className="w-6 h-6" />
        </div>
        <h4 className="text-4xl font-black tracking-tighter leading-none mb-1">{val}</h4>
        {subVal && <p className="text-xs font-black text-white/60 mb-2 uppercase tracking-tight">{subVal}</p>}
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{label}</p>
     </div>
  </div>
);
