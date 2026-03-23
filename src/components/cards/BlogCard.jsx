import React from 'react';
import { motion } from 'framer-motion';
import { HiCalendar, HiUser, HiTag, HiFire, HiLocationMarker, HiGlobeAlt, HiArrowRight } from 'react-icons/hi';
import { formatDate, truncate } from '../../core/utils/formatters';
import Badge from '../ui/Badge';
import SocialActionBar from '../ui/SocialActionBar';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BlogCard = ({ post }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/blog/${post.id}`)}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-100/30 transition-all duration-500 cursor-pointer"
    >
      {/* Cover Image */}
      <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <span className="text-4xl font-black text-white/20">SV</span>
          </div>
        )}
        {post.category && (
          <div className="absolute top-3 left-3">
            <Badge variant="primary">{post.category}</Badge>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-3 mb-4">
          {truncate(post.content, 150)}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            {post.authorName && (
              <span className="flex items-center gap-1">
                <HiUser className="w-3.5 h-3.5" /> {post.authorName}
              </span>
            )}
          </div>
          {post.createdAt && (
            <span className="flex items-center gap-1">
              <HiCalendar className="w-3.5 h-3.5" /> {formatDate(post.createdAt)}
            </span>
          )}
        </div>

        {/* Dynamic Registration Button */}
        <div className="mt-6 mb-2">
           <button
             onClick={(e) => { 
               e.stopPropagation(); 
               if (!user) {
                 navigate('/register', { state: { returnUrl: `/blog/${post.id}` } });
               } else {
                 navigate(`/blog/${post.id}`); 
               }
             }}
             className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all transform active:scale-95 shadow-sm"
           >
             {(!user) ? (
                <>Sign Up Account <HiArrowRight className="w-4 h-4" /></>
             ) : (
                <>Read Post <HiArrowRight className="w-4 h-4" /></>
             )}
           </button>
        </div>

        {/* Contact Actions */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
          <a
            href="tel:+251911234567"
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center justify-center py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-500 hover:text-emerald-500 transition-all group"
          >
            <HiFire className="w-4 h-4 mb-1" />
            <span className="text-[8px] font-black uppercase tracking-widest">Call</span>
          </a>
          <a
            href="sms:+251911234567"
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center justify-center py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-500 hover:text-blue-500 transition-all group"
          >
            <HiLocationMarker className="w-4 h-4 mb-1" />
            <span className="text-[8px] font-black uppercase tracking-widest">SMS</span>
          </a>
          <a
            href="mailto:contact@svtecher.com"
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center justify-center py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-500 hover:text-amber-500 transition-all group"
          >
            <HiGlobeAlt className="w-4 h-4 mb-1" />
            <span className="text-[8px] font-black uppercase tracking-widest">Email</span>
          </a>
        </div>

        {/* Social Features */}
        <div className="mt-2 text-slate-500 [&_button]:!border-slate-200">
          <SocialActionBar item={post} type="blog" />
        </div>
      </div>
    </motion.div>
  );
};

export default BlogCard;
