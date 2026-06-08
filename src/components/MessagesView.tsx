import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { User, View, DEFAULT_AVATAR } from '../types';
import { 
  Search, 
  Send, 
  Plus, 
  Image as ImageIcon, 
  Smile, 
  Video, 
  Phone, 
  Info, 
  Languages,
  Trash2
} from 'lucide-react';
import Sidebar from './shared/Sidebar';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  translatedText?: string;
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  lastMsg?: string;
}

interface MessagesViewProps {
  user: User;
  initialChatId?: string | null;
  onLogout?: () => void;
  onNavigate: (view: View) => void;
  isTranslateOnProp: boolean;
  onToggleTranslateProp: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function MessagesView({ user, initialChatId, onNavigate, onLogout, isTranslateOnProp, onToggleTranslateProp }: MessagesViewProps) {
  const [activeChat, setActiveChat] = useState<string | null>(initialChatId || null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  const isTranslateOn = isTranslateOnProp;
  const t = (ja: string, vi: string) => (isTranslateOn ? vi : ja);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Contacts
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE_URL}/api/users/friends`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.friends.map((f: any) => ({
            id: f.id,
            name: f.fullName,
            avatar: f.profilePicture || DEFAULT_AVATAR,
            status: f.isOnline ? 'online' : 'offline',
            lastMsg: t('メッセージを送信する...', 'Gửi tin nhắn...')
          }));
          setContacts(mapped);
          
          if (!activeChat && mapped.length > 0) {
            setActiveChat(mapped[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchFriends();
  }, [activeChat, isTranslateOn]);

  // Socket Init
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL;
    if (!socketUrl && !import.meta.env.DEV) return;
    socketRef.current = io(socketUrl || 'http://localhost:5000');
    
    socketRef.current.on('receive_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socketRef.current.on('message_deleted', (deletedId: string) => {
      setMessages(prev => prev.filter(m => m._id !== deletedId));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm(t('このメッセージを取り消しますか？', 'Bạn có chắc chắn muốn gỡ tin nhắn này không?'))) {
      socketRef.current?.emit('delete_message', {
        messageId,
        senderId: user.id,
        receiverId: activeChat
      });
      // Optimistic update
      setMessages(prev => prev.filter(m => m._id !== messageId));
    }
  };

  // Fetch Messages & Join Room
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE_URL}/api/messages/${activeChat}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchMessages();

    // Join room
    socketRef.current?.emit('join_chat', { userId: user.id, buddyId: activeChat });

  }, [activeChat, user.id]);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !activeChat) return;
    
    socketRef.current?.emit('send_message', {
      senderId: user.id,
      receiverId: activeChat,
      text: inputText
    });
    
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const activeContact = contacts.find(c => c.id === activeChat);

  return (
    <div className="flex bg-[#F8FAFC] h-screen overflow-hidden">
      <Sidebar currentView={View.MESSAGES} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 flex overflow-hidden">
         {/* Contacts List */}
         <div className="w-[380px] bg-white border-r border-slate-100 flex flex-col">
            <header className="p-8">
               <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-black text-[#0F4186] tracking-tight">{t('メッセージ', 'Tin nhắn')}</h1>
                  <button className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                    <Plus className="w-5 h-5 text-slate-500" />
                  </button>
               </div>
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0F4186]" />
                  <input 
                    type="text" 
                    placeholder={t('友達を検索...', 'Tìm kiếm bạn bè...')}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-[#0F4186] outline-none transition-all text-sm"
                  />
               </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
               {contacts.map((contact) => (
                 <button
                   key={contact.id}
                   onClick={() => setActiveChat(contact.id)}
                   className={`w-full p-4 rounded-[28px] mb-2 flex items-center gap-4 transition-all relative ${
                     activeChat === contact.id ? 'bg-blue-50 border-l-4 border-l-[#0F4186] shadow-sm' : 'hover:bg-slate-50'
                   }`}
                 >
                    <div className="relative flex-shrink-0">
                       <img src={contact.avatar} className="w-14 h-14 rounded-[20px] object-cover" alt="" />
                       {contact.status === 'online' && (
                         <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                       )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                       <div className="flex justify-between items-center mb-1">
                          <span className="font-extrabold text-slate-900 truncate">{contact.name}</span>
                       </div>
                       <p className="text-xs truncate text-slate-400">
                          {contact.lastMsg}
                       </p>
                    </div>
                 </button>
               ))}
               {contacts.length === 0 && (
                 <div className="p-8 text-center text-slate-400 text-sm">
                    {t('まだ友達がいません。', 'Chưa có bạn bè nào.')}
                 </div>
               )}
            </div>
         </div>

         {/* Chat Area */}
         {activeContact ? (
            <div className="flex-1 flex flex-col bg-slate-50/30">
               <header className="bg-white px-8 py-4 border-b border-slate-100 flex items-center justify-between z-10">
                  <div className="flex items-center gap-4">
                     <img src={activeContact.avatar} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md" alt="" />
                     <div>
                        <h2 className="font-bold text-slate-900 leading-none">{activeContact.name}</h2>
                        {activeContact.status === 'online' && (
                          <div className="flex items-center gap-1.5 mt-1 border border-transparent">
                             <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('オンライン', 'Trực tuyến')}</span>
                          </div>
                        )}
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     {/* Translation Switch */}
                     <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                        <Languages className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('自動翻訳', 'Tự động dịch')}</span>
                        <button 
                           onClick={onToggleTranslateProp}
                           className={`w-10 h-5 rounded-full relative transition-all ${isTranslateOn ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                           <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isTranslateOn ? 'right-1' : 'left-1'}`} />
                        </button>
                        <p className="text-[9px] font-black text-blue-600 border-l border-slate-200 pl-3">JP ↔ VN</p>
                     </div>
                     
                     <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
                       <button className="p-2.5 text-slate-400 hover:text-[#0F4186] hover:bg-blue-50 rounded-xl transition-all"><Phone className="w-5 h-5" /></button>
                       <button className="p-2.5 text-slate-400 hover:text-[#0F4186] hover:bg-blue-50 rounded-xl transition-all"><Video className="w-5 h-5" /></button>
                       <button className="p-2.5 text-slate-400 hover:text-[#0F4186] hover:bg-blue-50 rounded-xl transition-all"><Info className="w-5 h-5" /></button>
                     </div>
                  </div>
               </header>

               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="max-w-3xl mx-auto space-y-6">
                     {messages.length === 0 && (
                       <div className="text-center text-slate-400 my-10">
                          {t('メッセージを送信してチャットを開始しましょう！', 'Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện!')}
                       </div>
                     )}
                     {messages.map((msg) => {
                       const isMine = msg.senderId === user.id;
                       return isMine ? (
                         <div key={msg._id} className="flex flex-row-reverse gap-4 group">
                            <div className="max-w-[80%] space-y-1 relative">
                               <div className="bg-[#0F4186] p-4 rounded-[24px] rounded-br-md shadow-md shadow-blue-900/10">
                                  <p className="text-sm text-white leading-relaxed font-medium break-words">{msg.text}</p>
                                  {isTranslateOn && msg.translatedText && (
                                    <div className="pt-3 mt-3 border-t border-white/20 italic text-[11px] text-blue-100 break-words font-medium">
                                       {msg.translatedText}
                                    </div>
                                  )}
                               </div>
                               <div className="flex items-center justify-end pr-2 gap-2">
                                  <span className="text-[10px] font-bold text-slate-300 uppercase">{formatTime(msg.createdAt)}</span>
                               </div>
                               <button 
                                 onClick={() => handleDeleteMessage(msg._id)}
                                 className="absolute top-1/2 -left-10 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-red-50"
                                 title={t('メッセージを取り消す', 'Gỡ tin nhắn')}
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         </div>
                       ) : (
                         <div key={msg._id} className="flex gap-4 group">
                            <img src={activeContact.avatar} className="w-8 h-8 rounded-full object-cover self-end mb-5 shadow-sm" alt="" />
                            <div className="max-w-[80%] space-y-1">
                               <div className="bg-white p-4 rounded-[24px] rounded-bl-md border border-slate-100 shadow-sm shadow-blue-500/5">
                                  <p className="text-sm text-slate-800 leading-relaxed font-medium break-words">{msg.text}</p>
                                  {isTranslateOn && msg.translatedText && (
                                    <div className="pt-3 mt-3 border-t border-slate-100 italic text-[11px] text-slate-500 break-words font-medium">
                                       {msg.translatedText}
                                    </div>
                                  )}
                               </div>
                               <span className="text-[10px] font-bold text-slate-300 uppercase pl-2">{formatTime(msg.createdAt)}</span>
                            </div>
                         </div>
                       );
                     })}
                     <div ref={messagesEndRef} />
                  </div>
               </div>

               {/* Input Area */}
               <div className="p-8 bg-[#F8FAFC]">
                  <div className="max-w-3xl mx-auto flex items-center gap-4">
                     <div className="flex gap-2">
                        <button className="p-3 bg-white text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-[#0F4186] transition-all shadow-sm"><Plus className="w-5 h-5" /></button>
                        <button className="p-3 bg-white text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-[#0F4186] transition-all shadow-sm"><ImageIcon className="w-5 h-5" /></button>
                     </div>
                     <div className="flex-1 relative group">
                        <input 
                          type="text" 
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={t('メッセージを入力...', 'Nhập tin nhắn...')}
                          className="w-full pl-6 pr-14 py-5 bg-white border-2 border-transparent rounded-[28px] shadow-sm outline-none focus:border-[#0F4186] transition-all text-sm font-medium"
                        />
                        <button className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0F4186] transition-colors"><Smile className="w-6 h-6" /></button>
                     </div>
                     <button 
                       onClick={handleSend}
                       disabled={!inputText.trim()}
                       className="p-5 bg-[#0F4186] text-white rounded-[28px] shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                     >
                        <Send className="w-6 h-6" />
                     </button>
                  </div>
               </div>
            </div>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/30">
               <div className="text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                     <Send className="w-8 h-8 text-slate-300" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">{t('メッセージ', 'Tin nhắn')}</h2>
                  <p className="text-slate-500">{t('左側のリストから友達を選択してチャットを始めましょう', 'Hãy chọn một người bạn từ danh sách bên trái để bắt đầu trò chuyện')}</p>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
