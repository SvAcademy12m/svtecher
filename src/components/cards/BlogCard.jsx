import React from 'react';
import { motion } from 'framer-motion';
import { HiCalendar, HiUser, HiTag } from 'react-icons/hi';
import { formatDate, truncate } from '../../core/utils/formatters';
import Badge from '../ui/Badge';

const BlogCard = ({ post, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      onClick={() => onClick?.(post)}
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
      </div>
    </motion.div>
  );
};

export default BlogCard;
