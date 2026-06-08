import { useState, useEffect } from 'react';
import { User, View, DEFAULT_AVATAR } from '../types';
import { Search, Plus, MessageCircle, MoreVertical, Filter, Globe, Languages } from 'lucide-react';
import Sidebar from './shared/Sidebar';
import NotificationBell from './shared/NotificationBell';

interface Friend {
  id: string;
  fullName: string;
  profilePicture: string;
  nationality: string;
  japaneseLevel: string;
  vietnameseLevel: string;
  isOnline: boolean;
}

interface BuddiesViewProps {
  user: User;
  onNavigate: (view: View) => void;
  onSelectBuddy: (id: string) => void;
  onStartChat?: (id: string) => void;
  onLogout?: () => void;
  isTranslateOn: boolean;
  onToggleTranslate: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function BuddiesView({ user, onNavigate, onSelectBuddy, onStartChat, onLogout, isTranslateOn, onToggleTranslate }: BuddiesViewProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'online'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const t = (ja: string, vi: string) => (isTranslateOn ? vi : ja);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE_URL}/api/users/friends`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFriends(data.friends || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFriends();
  }, []);

  const filteredFriends = filterTab === 'all' ? friends : friends.filter(f => f.isOnline);

  return (
    <div className="flex bg-[#F8FAFC] h-screen overflow-hidden">
      <Sidebar currentView={View.BUDDIES} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md px-8 py-4 flex items-center justify-between">
           <div className="w-96 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0F4186]" />
              <input 
                type="text" 
                placeholder={t('バディを検索...', 'Tìm kiếm bạn bè...')}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-[#0F4186] shadow-sm transition-all"
              />
           </div>
           <div className="flex items-center gap-3">
              {/* Translation Switch */}
              <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                 <Languages className="w-3.5 h-3.5 text-blue-600" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('自動翻訳', 'Tự động dịch')}</span>
                 <button 
                    type="button"
                    onClick={onToggleTranslate}
                    className={`w-9 h-4.5 rounded-full relative transition-all ${isTranslateOn ? 'bg-blue-600' : 'bg-slate-300'}`}
                 >
                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${isTranslateOn ? 'right-0.5' : 'left-0.5'}`} />
                 </button>
                 <p className="text-[8px] font-black text-blue-600 border-l border-slate-200 pl-2">JP ↔ VN</p>
              </div>
              <NotificationBell />
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>{t('フィルター', 'Bộ lọc')}</span>
              </button>
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200">
                <img src={user.avatar} alt="Profile" />
              </div>
           </div>
        </header>

        <main className="p-8 max-w-6xl mx-auto">
           <div className="flex items-end justify-between mb-10">
              <div>
                <h1 className="text-3xl font-extrabold text-[#0F4186] mb-2 tracking-tight">{t('バディー一覧', 'Danh sách bạn bè')}</h1>
                <p className="text-slate-500 font-medium">{t('あなたと言語交換をしているパートナーたち', 'Những đối tác đang giao lưu ngôn ngữ với bạn')}</p>
              </div>
              <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                 <button 
                   onClick={() => setFilterTab('all')}
                   className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors ${filterTab === 'all' ? 'bg-[#0F4186] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50'}`}
                 >{t('すべて', 'Tất cả')}</button>
                 <button 
                   onClick={() => setFilterTab('online')}
                   className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors ${filterTab === 'online' ? 'bg-[#0F4186] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50'}`}
                 >{t('オンライン', 'Trực tuyến')}</button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  {t('バディを読み込んでいます...', 'Đang tải danh sách bạn bè...')}
                </div>
              ) : filteredFriends.map((buddy, i) => (
                <div 
                  key={buddy.id} 
                  className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group flex flex-col items-center text-center relative border-b-4 border-b-transparent hover:border-b-[#0F4186]"
                >
                   {/* Status Badge */}
                   <div className="px-3 py-1 bg-rose-50 rounded-full border border-rose-100 mb-4">
                      <span className="text-[9px] font-black uppercase text-rose-600 tracking-widest">{t(`Matched ${i + 1} weeks ago`, `Đã kết đôi ${i + 1} tuần trước`)}</span>
                   </div>

                   <button onClick={() => onSelectBuddy(buddy.id)} className="relative mb-6 cursor-pointer">
                      <img src={buddy.profilePicture || DEFAULT_AVATAR} className="w-24 h-24 rounded-[32px] object-cover border-4 border-slate-50 shadow-lg group-hover:scale-105 transition-transform" alt="" />
                      {buddy.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                      )}
                   </button>

                   <button onClick={() => onSelectBuddy(buddy.id)} className="hover:underline">
                     <h3 className="text-xl font-extrabold text-slate-900 mb-2">{buddy.fullName}</h3>
                   </button>
                   
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                      <Globe className="w-3.5 h-3.5 text-[#0F4186]" />
                      <span>{buddy.nationality} / JP: {buddy.japaneseLevel} / VN: {buddy.vietnameseLevel}</span>
                   </div>

                   <div className="w-full mt-auto">
                      <button 
                        onClick={() => onStartChat && onStartChat(buddy.id)}
                        className="w-full py-3.5 bg-[#0F4186] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-[#0D3875] flex items-center justify-center gap-2"
                      >
                         <MessageCircle className="w-4 h-4" />
                         <span>{t('メッセージ', 'Tin nhắn')}</span>
                      </button>
                   </div>
                </div>
              ))}

              {/* Add New Buddy Placeholder */}
              <div onClick={() => onNavigate(View.FEED)} className="bg-white p-10 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center hover:border-[#0F4186] hover:bg-blue-50/30 transition-all group cursor-pointer h-full">
                 <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-[#0F4186]" />
                 </div>
                 <h4 className="text-lg font-bold text-[#0F4186] mb-2 tracking-tight">{t('新しいバディを探す', 'Tìm bạn bè mới')}</h4>
                 <p className="text-xs text-slate-400 font-medium">{t('共通の趣味を持つ人を見つけましょう', 'Hãy tìm những người có chung sở thích')}</p>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}
