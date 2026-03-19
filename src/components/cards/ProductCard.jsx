import React from 'react';
import { motion } from 'framer-motion';
import { HiGlobe, HiDeviceMobile, HiShoppingCart, HiArrowSmRight, HiFire, HiLocationMarker, HiGlobeAlt } from 'react-icons/hi';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Badge from '../ui/Badge';
import SocialActionBar from '../ui/SocialActionBar';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice, formatDualPrice } = useCurrency();
  const { t } = useLanguage();

  const typeIcon = (type) => {
    switch (type) {
      case 'mobile_app': return <HiDeviceMobile className="w-5 h-5 flex-shrink-0" />;
      case 'website':
      case 'web_app': return <HiGlobe className="w-5 h-5 flex-shrink-0" />;
      default: return <HiShoppingCart className="w-5 h-5 flex-shrink-0" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl transition-all flex flex-col h-full"
    >
      {/* Visual Identity */}
      <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-100 dark:bg-white/5">
        {product.thumbnail ? (
          <img 
            src={product.thumbnail} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black/10">
            <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-blue-700 mb-4 transform group-hover:rotate-12 transition-transform shadow-xl">
              {typeIcon(product.type)}
            </div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Premium Digital Asset</p>
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <Badge variant="primary" className="!bg-blue-600 !backdrop-blur-md shadow-lg shadow-blue-500/30 font-black uppercase tracking-widest text-[9px] px-3 py-1.5">
            {product.type?.replace('_', ' ')}
          </Badge>
          {product.status === 'sold' ? (
            <Badge variant="danger" className="font-black uppercase tracking-widest text-[9px]">Sold Out</Badge>
          ) : (
             <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-[#0e1225]/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-600 dark:text-cyan-400 shadow-xl">
                <HiShoppingCart className="w-5 h-5" />
             </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-7 flex flex-col flex-1">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
             <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest bg-white/10 px-2 py-1 rounded-lg">Exclusive Content</span>
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-cyan-300 transition-colors">
            {product.name}
          </h3>
          <p className="mt-3 text-sm font-bold text-blue-100/70 line-clamp-3 leading-relaxed">
            {product.description || "Transform your digital footprint with this professionally engineered platform."}
          </p>
          
          <div className="mt-5 flex flex-wrap gap-2">
             {product.tech?.split(',').map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-black text-blue-200 uppercase tracking-widest border border-white/10">
                   {tag.trim()}
                </span>
             ))}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between mb-6">
          <div>
            <p className="text-xl font-black text-white leading-none">
              {formatPrice(product.price)}
            </p>
            <p className="text-[11px] font-black text-blue-300 uppercase tracking-widest mt-1">
              {formatDualPrice(product.price).usd}
            </p>
          </div>
          
          <button 
            onClick={() => {
              if (!user) {
                navigate('/register', { state: { defaultRole: 'customer', returnUrl: '/services' } });
              } else {
                toast.info("Purchase protocol initialized. Our sales team will contact you!");
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-cyan-400 hover:text-white transition-all shadow-xl active:scale-95"
          >
             {(!user) ? 'SIGN UP BUYER' : 'PURCHASE ASSET'} <HiArrowSmRight className="w-4 h-4" />
          </button>
        </div>

        {/* Contact Actions */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <a
            href="tel:+251911234567"
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center justify-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all group"
          >
            <HiFire className="w-4 h-4 mb-1 group-hover:text-emerald-400 opacity-70 group-hover:opacity-100" />
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">Call</span>
          </a>
          <a
            href="sms:+251911234567"
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center justify-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all group"
          >
            <HiLocationMarker className="w-4 h-4 mb-1 group-hover:text-blue-400 opacity-70 group-hover:opacity-100" />
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">SMS</span>
          </a>
          <a
            href="mailto:contact@svtecher.com"
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center justify-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all group"
          >
            <HiGlobeAlt className="w-4 h-4 mb-1 group-hover:text-amber-400 opacity-70 group-hover:opacity-100" />
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">Email</span>
          </a>
        </div>

        {/* Social Features */}
        <SocialActionBar item={product} type="product" />
      </div>
    </motion.div>
  );
};

export default ProductCard;
