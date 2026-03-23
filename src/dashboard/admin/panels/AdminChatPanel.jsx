import React, { useState, useEffect, useRef } from 'react';
import {
  HiChat, HiSearch, HiPaperAirplane, HiUser, HiDotsCircleHorizontal,
  HiX, HiSparkles
} from 'react-icons/hi';
import {
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp,
  doc, setDoc, getDoc, updateDoc
} from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getInitials } from '../../../core/utils/formatters';

const getChatId = (uid1, uid2) => [uid1, uid2].sort().join('_');

const AdminChatPanel = ({ allUsers }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [presenceMap, setPresenceMap] = useState({});
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  // Filter out admins from users list
  const chatUsers = allUsers.filter(u => u.id !== user?.uid && u.role !== 'admin');
  const filteredUsers = chatUsers.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Subscribe to all user presence
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'presence'), (snap) => {
      const map = {};
      snap.docs.forEach(d => { map[d.id] = d.data(); });
      setPresenceMap(map);
    });
    return () => unsub();
  }, []);

  // Subscribe to chat messages
  useEffect(() => {
    if (!selectedUser || !user?.uid) return;
    const chatId = getChatId(user.uid, selectedUser.id);
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [selectedUser, user]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser || !user?.uid) return;
    const chatId = getChatId(user.uid, selectedUser.id);
    const text = messageText.trim();
    setMessageText('');
    try {
      // Ensure chat document exists
      await setDoc(doc(db, 'chats', chatId), {
        participants: [user.uid, selectedUser.id],
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      // Add message
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text,
        senderId: user.uid,
        senderName: 'Admin',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Send message failed:', err);
    }
  };

  const isOnline = (uid) => {
    const p = presenceMap[uid];
    if (!p || !p.online) return false;
    // Consider online if last seen within 3 minutes
    if (p.lastSeen?.seconds) {
      const diff = Date.now() / 1000 - p.lastSeen.seconds;
      return diff < 180;
    }
    return p.online === true;
  };

  const onlineCount = chatUsers.filter(u => isOnline(u.id)).length;

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[400px] bg-white dark:bg-[#0e1225] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
      {/* Left: User List */}
      <div className="w-64 shrink-0 border-r border-gray-100 dark:border-white/5 flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 dark:border-white/5 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white">Direct Messages</h3>
              <p className="text-[10px] font-medium text-gray-400 dark:text-white/40">{onlineCount} online now</p>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-200 dark:border-emerald-700/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400">{onlineCount}</span>
            </div>
          </div>
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <HiSearch className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-xs font-medium text-gray-700 dark:text-white placeholder-gray-400 w-full"
            />
          </div>
        </div>

        {/* User list (scrollable) */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {filteredUsers.length === 0 && (
            <div className="py-8 text-center text-xs font-medium text-gray-400">No users found</div>
          )}
          {filteredUsers.map(u => {
            const online = isOnline(u.id);
            const isActive = selectedUser?.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-gray-50 dark:border-white/5 ${
                  isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shadow ${
                    isActive ? 'bg-blue-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  }`}>
                    {getInitials(u.name)}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0e1225] ${online ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-gray-900 dark:text-white truncate">{u.name || 'User'}</p>
                  <p className={`text-[10px] font-medium ${online ? 'text-emerald-500' : 'text-gray-400 dark:text-white/30'}`}>
                    {online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Chat Area */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black">
                  {getInitials(selectedUser.name)}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0e1225] ${isOnline(selectedUser.id) ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white">{selectedUser.name}</h4>
                <p className={`text-[10px] font-medium ${isOnline(selectedUser.id) ? 'text-emerald-500' : 'text-gray-400'}`}>
                  {isOnline(selectedUser.id) ? '● Online now' : '○ Offline'}
                </p>
              </div>
            </div>
            <button onClick={() => setSelectedUser(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
              <HiX className="w-4 h-4" />
            </button>
          </div>

          {/* Messages (scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ scrollbarWidth: 'thin' }}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-50">
                <HiChat className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-500 dark:text-white">No messages yet</p>
                <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Start the conversation with {selectedUser.name}</p>
              </div>
            )}
            {messages.map((msg) => {
              const isAdmin = msg.senderId === user?.uid;
              return (
                <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                    isAdmin
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-bl-sm'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    <p className={`text-[9px] mt-1 font-medium ${isAdmin ? 'text-blue-200' : 'text-gray-400 dark:text-white/40'}`}>
                      {msg.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="flex items-center gap-3 px-5 py-3.5 border-t border-gray-100 dark:border-white/5 shrink-0">
            <input
              type="text"
              placeholder={`Message ${selectedUser.name}...`}
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-blue-500/20 disabled:shadow-none shrink-0"
            >
              <HiPaperAirplane className="w-4 h-4 rotate-90" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
          <HiChat className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-base font-black text-gray-600 dark:text-white mb-1">Select a User</h3>
          <p className="text-sm text-gray-400 dark:text-white/40">Choose a user from the list to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default AdminChatPanel;
