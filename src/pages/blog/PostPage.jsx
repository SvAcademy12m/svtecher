import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogService } from '../../core/services/firestoreService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatDateTime } from '../../core/utils/formatters';
import { HiArrowLeft, HiCalendar, HiUser, HiChatAlt2, HiPaperAirplane } from 'react-icons/hi';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';
import { addDoc, collection, serverTimestamp, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../core/firebase/firebase';

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const snap = await blogService.getById(id);
        if (snap.exists()) {
          setPost({ id: snap.id, ...snap.data() });
        } else {
          toast.error("Article not found.");
          navigate('/blog');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();

    // Real-time comments
    const q = query(collection(db, 'comments'), where('postId', '==', id), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [id, navigate]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.warning("Please sign in to join the conversation.");
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        postId: id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous User',
        userPhoto: user.photoURL || '',
        text: commentText,
        createdAt: serverTimestamp()
      });
      setCommentText('');
      toast.success("Syncing your thought to the ecosystem...");
    } catch (err) {
      toast.error("Protocol failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner fullScreen />;
  if (!post) return null;

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 mb-10 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" /> Back to Terminal
        </button>

        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <header className="space-y-6">
            <div className="flex items-center gap-4 text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">
              <span className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{post.category || 'Tech Culture'}</span>
              <span className="flex items-center gap-1"><HiCalendar className="w-3.5 h-3.5" /> {formatDate(post.createdAt)}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tighter uppercase">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 py-6 border-y border-slate-100">
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg">
                 {post.authorName?.[0] || 'S'}
               </div>
               <div>
                 <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{post.authorName || 'SVTECH System'}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Tech Contributor</p>
               </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.coverImage && (
            <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/10">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none text-slate-700 font-medium leading-relaxed uppercase tracking-tight">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          <hr className="border-slate-100" />

          {/* Comments Section */}
          <section className="space-y-12 pt-10">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                 <HiChatAlt2 className="text-blue-600" /> Conversation <span className="text-slate-300">({comments.length})</span>
               </h3>
               {!user && <p className="text-[10px] font-black text-slate-400 uppercase">Sign in to join the conversation</p>}
            </div>

            {/* Comment Form */}
            {user && (
              <form onSubmit={handleCommentSubmit} className="relative group">
                <textarea 
                  rows="3"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="SYNC YOUR THOUGHTS..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-600/20 focus:bg-white transition-all uppercase"
                />
                <button 
                  disabled={submitting || !commentText.trim()}
                  className="absolute bottom-6 right-6 p-4 rounded-2xl bg-blue-700 text-white shadow-xl shadow-blue-700/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <HiPaperAirplane className="w-5 h-5 rotate-90" />
                </button>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-8">
              {comments.map((comment, i) => (
                <motion.div 
                  key={comment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-6 group"
                >
                   <div className="w-12 h-12 rounded-2xl bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-400 font-black text-xs overflow-hidden border border-slate-200 group-hover:border-blue-200 transition-colors">
                      {comment.userPhoto ? (
                        <img src={comment.userPhoto} alt={comment.userName} className="w-full h-full object-cover" />
                      ) : (
                        comment.userName?.[0] || 'U'
                      )}
                   </div>
                   <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                         <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{comment.userName}</p>
                         <p className="text-[9px] font-bold text-slate-300 lowercase">{comment.createdAt ? formatDateTime(comment.createdAt) : 'just now'}</p>
                      </div>
                      <div className="bg-slate-50/50 p-5 rounded-2xl group-hover:bg-slate-50 transition-colors">
                         <p className="text-sm text-slate-600 font-bold leading-relaxed uppercase tracking-tight">
                           {comment.text}
                         </p>
                      </div>
                   </div>
                </motion.div>
              ))}
              {comments.length === 0 && (
                <div className="py-12 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">The terminal is silent. Be the first to start the protocol.</p>
                </div>
              )}
            </div>
          </section>
        </motion.article>
      </div>
    </div>
  );
};

export default PostPage;
