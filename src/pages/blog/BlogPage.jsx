import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { blogService } from '../../core/services/firestoreService';
import BlogCard from '../../components/cards/BlogCard';
import Spinner from '../../components/ui/Spinner';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = blogService.subscribe((data) => {
      setPosts(data.filter(p => p.status === 'published'));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <section className="bg-gradient-to-br from-blue-600 to-cyan-500 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black text-white mb-4">
            Tech Blog & Insights
          </motion.h1>
          <p className="text-blue-100 max-w-xl mx-auto font-medium">Expert tutorials, industry news, and digital strategy from the SvTech Academy Terminal.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-sm">No articles published yet. Stay tuned!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
