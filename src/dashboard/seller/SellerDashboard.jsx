import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiHome, HiShoppingCart, HiCurrencyDollar, HiLogout, HiMenu, HiX, 
  HiUpload, HiCollection, HiTranslate, HiMoon, HiSun, HiGlobe, 
  HiCog, HiLink, HiTrendingUp, HiUserGroup, HiMail, HiStar
} from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTheme } from '../../contexts/ThemeContext';
import { logoutUser } from '../../core/services/authService';
import { getInitials } from '../../core/utils/formatters';
import SocialEarningsCard from '../../components/cards/SocialEarningsCard';

const SellerDashboard = () => {
  const [activePanel, setActivePanel] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { userData, user } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const { currency, toggleCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navSections = [
    {
      title: 'Seller Hub',
      items: [
        { key: 'overview', label: 'Dashboard', icon: HiHome },
        { key: 'my-products', label: 'My Products', icon: HiCollection },
        { key: 'orders', label: 'Orders', icon: HiShoppingCart },
        { key: 'referrals', label: 'Referrals', icon: HiLink },
      ]
    },
    {
      title: 'Tools',
      items: [
        { key: 'earnings', label: 'Earnings', icon: HiCurrencyDollar },
        { key: 'reviews', label: 'Reviews', icon: HiStar },
        { key: 'messages', label: 'Messages', icon: HiMail },
      ]
    }
  ];

  const getPanelLabel = () => navSections.flatMap(s => s.items).find(i => i.key === activePanel)?.label || 'Dashboard';

  const handleLogout = async () => { await logoutUser(); navigate('/'); };

  const SidebarContent = ({ onNavClick }) => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-8 flex items-center gap-4 border-b border-white/10 shrink-0">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
          <span className="text-amber-700 font-black text-xl">SV</span>
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight leading-none text-white">Seller</h1>
          <p className="text-[10px] font-black text-amber-200 tracking-widest mt-1 uppercase">Marketplace Portal</p>
        </div>
      </div>
      <nav className="flex-1 px-4 py-8 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-10' : ''}>
            <h3 className="px-5 text-[10px] font-black text-amber-100 uppercase tracking-[0.2em] mb-4 opacity-50">{section.title}</h3>
            <div className="space-y-2">
              {section.items.map(item => (
                <button key={item.key} onClick={() => { setActivePanel(item.key); onNavClick?.(); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-sm tracking-tight ${
                    activePanel === item.key ? 'bg-white/20 text-white shadow-xl border border-white/20' : 'text-amber-100 hover:bg-white/10 hover:text-white'
                  }`}>
                  <item.icon className={`w-5 h-5 ${activePanel === item.key ? 'scale-110' : ''}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-6 mt-auto border-t border-white/10 shrink-0">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs tracking-widest shadow-xl hover:bg-rose-600 transition-all active:scale-95 group mb-6">
          <HiLogout className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Sign Out
        </button>
        <div className="p-2 bg-white/10 rounded-2xl border border-white/20 flex items-center gap-4 pr-6">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-700 font-black shadow-lg">{getInitials(userData?.name)}</div>
          <div className="hidden sm:block text-right">
            <p className="text-xs font-black text-white leading-none truncate max-w-[100px]">{userData?.name || 'Seller'}</p>
            <p className="text-[9px] font-black text-amber-200 tracking-wider mt-1 opacity-60 uppercase">Digital Merchant</p>
          </div>
        </div>
      </div>
    </div>
  );

  const earnings = userData?.earnings || 0;
  const walletBalance = userData?.walletBalance || 0;

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] dark:bg-[#080b18] overflow-x-hidden font-sans pb-20 lg:pb-0">
      <aside className="hidden lg:flex flex-col w-72 bg-gradient-to-b from-amber-600 to-orange-800 text-white shadow-2xl sticky top-0 h-screen overflow-hidden z-30">
        <SidebarContent />
      </aside>
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-[300px] bg-gradient-to-b from-amber-600 to-orange-800 text-white shadow-2xl animate-in slide-in-from-left">
            <button onClick={() => setMobileSidebarOpen(false)} className="absolute top-6 -right-12 w-10 h-10 flex items-center justify-center rounded-xl text-white bg-amber-600 shadow-xl z-50">
              <HiX className="w-6 h-6" />
            </button>
            <SidebarContent onNavClick={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col relative min-w-0">
        <header className="h-24 bg-gradient-to-r from-amber-600 to-orange-800 text-white flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 shadow-2xl border-b border-white/10">
          <div className="flex items-center gap-6 flex-1">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-3 bg-white/10 rounded-2xl text-white"><HiMenu className="w-6 h-6" /></button>
            <h2 className="hidden md:block text-2xl font-black text-white tracking-tighter uppercase">{getPanelLabel()}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
              <HiUpload className="w-4 h-4" /> Upload Product
            </button>
            <div className="hidden sm:flex items-center gap-2 p-1 bg-white/10 rounded-2xl border border-white/20">
              <button onClick={toggleLanguage} className="p-2.5 rounded-xl hover:bg-white/20 text-white relative">
                <HiTranslate className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-amber-500 rounded-full text-[8px] font-black border border-white">{lang}</span>
              </button>
              <button onClick={toggleCurrency} className="p-2.5 rounded-xl hover:bg-white/20 text-white"><HiCurrencyDollar className="w-5 h-5" /></button>
              <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white/20 text-white">{theme === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}</button>
            </div>
            <div className="flex items-center gap-3 p-1.5 bg-white/10 rounded-2xl border border-white/20 cursor-pointer group">
              <div className="hidden lg:block text-right pl-3 pr-1">
                <p className="text-xs font-black text-white leading-none truncate max-w-[120px]">{userData?.name || 'Seller'}</p>
                <p className="text-[9px] font-black text-amber-200 tracking-wider mt-1.5 opacity-70 uppercase">Verified Merchant</p>
              </div>
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-amber-700 font-black shadow-lg group-hover:scale-105 transition-transform">{getInitials(userData?.name)}</div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-10 overflow-y-auto bg-[#f8fbff] dark:bg-[#080b18]">
          {activePanel === 'overview' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <div>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 uppercase">Seller Dashboard</h3>
                <p className="text-[10px] font-black text-slate-500 dark:text-white/40 tracking-[0.3em] uppercase">Merchant Control Center</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Products" val="0" icon={HiCollection} color="from-amber-500 to-orange-600" />
                <StatCard label="Revenue" val={`${earnings} Br`} icon={HiTrendingUp} color="from-emerald-500 to-teal-600" />
                <StatCard label="Wallet" val={`${walletBalance} Br`} icon={HiCurrencyDollar} color="from-blue-600 to-indigo-700" />
                <StatCard label="Followers" val={userData?.followersCount || 0} icon={HiUserGroup} color="from-purple-600 to-indigo-700" />
              </div>
              <div className="text-center py-24 bg-white dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/10 shadow-inner">
                <div className="w-20 h-20 bg-slate-50 dark:bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                  <HiShoppingCart className="w-10 h-10 text-slate-300 dark:text-white/20" />
                </div>
                <p className="text-lg font-black text-slate-500 dark:text-white/40 uppercase tracking-widest mb-6">No products listed yet</p>
                <button className="px-10 py-4 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-amber-700 transition-all">Upload First Product</button>
              </div>

              {/* Social Media Daily Earnings */}
              <div className="mt-10">
                <SocialEarningsCard userId={user?.uid} />
              </div>
            </div>
          )}
          {activePanel !== 'overview' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse">
                <HiCog className="w-12 h-12 text-slate-300 dark:text-white/20" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3">{activePanel.replace(/-/g, ' ')}</h3>
              <p className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">Coming soon...</p>
            </div>
          )}
        </main>
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/80 dark:bg-[#0e1225]/80 backdrop-blur-xl border border-slate-100 dark:border-white/10 px-6 py-3 rounded-2xl flex items-center justify-between shadow-2xl">
          <MobileNavItem active={activePanel === 'overview'} icon={HiHome} onClick={() => setActivePanel('overview')} />
          <MobileNavItem active={activePanel === 'my-products'} icon={HiCollection} onClick={() => setActivePanel('my-products')} />
          <button onClick={() => setMobileSidebarOpen(true)} className="w-14 h-14 -mt-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl flex items-center justify-center text-white shadow-2xl border-4 border-white dark:border-[#0e1225]">
            <HiMenu className="w-7 h-7" />
          </button>
          <MobileNavItem active={activePanel === 'earnings'} icon={HiCurrencyDollar} onClick={() => setActivePanel('earnings')} />
          <MobileNavItem active={activePanel === 'messages'} icon={HiMail} onClick={() => setActivePanel('messages')} />
        </nav>
      </div>
    </div>
  );
};

const StatCard = ({ label, val, icon: Icon, color }) => (
  <div className={`bg-gradient-to-br ${color} p-8 rounded-[2.5rem] text-white relative overflow-hidden group border border-white/10 shadow-xl`}>
    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000"><Icon className="w-24 h-24" /></div>
    <div className="relative z-10">
      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/20"><Icon className="w-6 h-6" /></div>
      <h4 className="text-4xl font-black tracking-tighter leading-none mb-1">{val}</h4>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{label}</p>
    </div>
  </div>
);

const MobileNavItem = ({ active, icon: Icon, onClick }) => (
  <button onClick={onClick} className={`p-3 rounded-xl transition-all ${active ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 dark:text-white/40'}`}>
    <Icon className="w-6 h-6" />
  </button>
);

export default SellerDashboard;
