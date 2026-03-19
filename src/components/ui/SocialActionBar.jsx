import React, { useState } from 'react';
import { HiThumbUp, HiThumbDown, HiChatAlt2, HiUserAdd, HiCheck } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const SocialActionBar = ({ item, type = 'post' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Local state for instant UI feedback (Mock for now, would connect to Firestore in prod)
  const [likes, setLikes] = useState(item.likes || Math.floor(Math.random() * 100));
  const [dislikes, setDislikes] = useState(item.dislikes || Math.floor(Math.random() * 10));
  const [comments, setComments] = useState(item.comments || Math.floor(Math.random() * 50));
  
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleAction = (e, action) => {
    e.stopPropagation(); // Prevent card click
    
    if (!user) {
      toast.info('Please sign up to interact!');
      navigate('/register', { state: { returnUrl: `/${type}s` } });
      return;
    }

    switch (action) {
      case 'like':
        if (hasLiked) { setLikes(l => l - 1); setHasLiked(false); }
        else { 
          setLikes(l => l + 1); setHasLiked(true);
          if (hasDisliked) { setDislikes(d => d - 1); setHasDisliked(false); }
        }
        break;
      case 'dislike':
        if (hasDisliked) { setDislikes(d => d - 1); setHasDisliked(false); }
        else {
          setDislikes(d => d + 1); setHasDisliked(true);
          if (hasLiked) { setLikes(l => l - 1); setHasLiked(false); }
        }
        break;
      case 'comment':
        toast.info('Comment feature opening...');
        // Would open a modal or navigate to detail page
        break;
      case 'follow':
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? 'Unfollowed' : 'Following successfully!');
        break;
      default: break;
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4 text-slate-400">
      <div className="flex items-center gap-4">
        {/* Like */}
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={(e) => handleAction(e, 'like')}
          className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${hasLiked ? 'text-blue-500' : 'hover:text-blue-400'}`}
        >
          {hasLiked ? <HiThumbUp className="w-4 h-4" /> : <HiThumbUp className="w-4 h-4 opacity-50" />}
          {likes > 0 && <span>{likes}</span>}
        </motion.button>

        {/* Dislike */}
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={(e) => handleAction(e, 'dislike')}
          className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${hasDisliked ? 'text-rose-500' : 'hover:text-rose-400'}`}
        >
          {hasDisliked ? <HiThumbDown className="w-4 h-4" /> : <HiThumbDown className="w-4 h-4 opacity-50" />}
          {dislikes > 0 && <span>{dislikes}</span>}
        </motion.button>

        {/* Comment */}
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={(e) => handleAction(e, 'comment')}
          className="flex items-center gap-1.5 text-xs font-bold hover:text-cyan-400 transition-colors"
        >
          <HiChatAlt2 className="w-4 h-4 opacity-50" />
          {comments > 0 && <span>{comments}</span>}
        </motion.button>
      </div>

      {/* Follow / Save */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={(e) => handleAction(e, 'follow')}
        className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${
          isFollowing 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
        }`}
      >
        {isFollowing ? (
          <><HiCheck className="w-3 h-3" /> Following</>
        ) : (
          <><HiUserAdd className="w-3 h-3" /> Follow</>
        )}
      </motion.button>
    </div>
  );
};

export default SocialActionBar;
