import { useState, useEffect } from 'react';
import { User, View, DEFAULT_AVATAR } from '../types';
import { Search, Calendar, MapPin, Users, Heart, Share2, Info, ChevronRight, Globe, Bookmark, Loader2, Languages } from 'lucide-react';
import Sidebar from './shared/Sidebar';

interface EventsViewProps {
  user: User;
  onNavigate: (view: View) => void;
  onLogout?: () => void;
  isTranslateOn: boolean;
  onToggleTranslate: () => void;
}

export default function EventsView({ user, onNavigate, onLogout, isTranslateOn, onToggleTranslate }: EventsViewProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const t = (ja: string, vi: string) => (isTranslateOn ? vi : ja);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/events', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
          if (data.events && data.events.length > 0) {
            setFeaturedEvent(data.events[0]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleJoinEvent = async (eventId: string) => {
    if (joining) return;
    setJoining(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedEvents = events.map(ev => {
          if (ev._id === eventId) {
            return { ...ev, attendees: [...(ev.attendees || []), user.id] };
          }
          return ev;
        });
        setEvents(updatedEvents);
        if (featuredEvent && featuredEvent._id === eventId) {
          setFeaturedEvent({ ...featuredEvent, attendees: [...(featuredEvent.attendees || []), user.id] });
        }
      } else {
        const err = await res.json();
        alert(t(`エラー: ${err.message}`, `Lỗi: ${err.message}`));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] h-screen overflow-hidden">
      <Sidebar currentView={View.EVENTS} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-[#F8FAFC]/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-100">
           <div className="w-96 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={t('イベントを検索...', 'Tìm kiếm sự kiện...')}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#0F4186] transition-all"
              />
           </div>
           <div className="flex items-center gap-4">
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
              <button className="p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
                <Bookmark className="w-5 h-5 text-slate-600" />
              </button>
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200">
                <img src={user.avatar} alt="Profile" />
              </div>
           </div>
        </header>

        <main className="max-w-6xl mx-auto p-12">
           <div className="mb-12">
              <h1 className="text-4xl font-extrabold text-[#0F4186] mb-4 tracking-tight leading-none">{t('文化の架け橋', 'Cầu nối văn hóa')} <span className="text-slate-400 font-light">{t('ハノイ', 'Hà Nội')}</span></h1>
              <p className="text-slate-500 max-w-2xl leading-relaxed">
                {t('日本とベトナムのコミュニティを繋ぐ、最高の言語交換ミートアップ、文化ワークショップ、ネットワーキングイベントを見つけましょう。', 'Tìm kiếm các buổi gặp gỡ trao đổi ngôn ngữ, hội thảo văn hóa và sự kiện kết nối tốt nhất để kết nối cộng đồng Nhật - Việt.')}
              </p>
           </div>

           <div className="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
              {[t('近日開催のイベント', 'Sự kiện sắp diễn ra'), t('ワークショップ', 'Hội thảo'), t('言語交換', 'Trao đổi ngôn ngữ'), t('交流会', 'Giao lưu')].map((cat, i) => (
                <button 
                   key={cat} 
                   className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                     i === 0 ? 'bg-[#0F4186] text-white shadow-xl shadow-blue-500/20' : 'bg-white text-slate-500 border border-slate-200 hover:border-[#0F4186] hover:text-[#0F4186]'
                   }`}
                >
                  {cat}
                </button>
              ))}
           </div>

           <div className="flex flex-col lg:flex-row gap-12">
              {/* Event List */}
              <div className="flex-1 space-y-8">
                  <div className="flex items-center justify-between mb-2">
                     <h2 className="text-xl font-bold text-slate-900">{t('すべてのイベントを閲覧', 'Khám phá tất cả sự kiện')}</h2>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t(`${events.length}件のイベントが見つかりました`, `Tìm thấy ${events.length} sự kiện`)}</span>
                  </div>

                  {loading && <div className="p-8 text-center"><Loader2 className="w-8 h-8 text-[#0F4186] animate-spin mx-auto" /></div>}
                  {!loading && events.length === 0 && <div className="p-8 text-center text-slate-500">{t('イベントがありません。', 'Không có sự kiện nào.')}</div>}

                  {!loading && events.map((event) => (
                     <div key={event._id} onClick={() => setFeaturedEvent(event)} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm flex group cursor-pointer hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                        <div className="w-48 relative overflow-hidden">
                           <img src={event.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                           <div className="absolute top-4 left-4 bg-rose-500 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-widest">{t('注目イベント', 'Sự kiện nổi bật')}</div>
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                           <div className="flex justify-between items-start mb-4">
                              <div>
                                 <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">{t('文化 • CULTURE', 'Văn hóa • CULTURE')}</p>
                                 <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 group-hover:text-[#0F4186] transition-colors">{event.title}</h3>
                              </div>
                              <button className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                 <Bookmark className="w-4 h-4 text-slate-400" />
                              </button>
                           </div>
                           
                           <div className="space-y-2 mb-6">
                              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                 <Calendar className="w-3.5 h-3.5" />
                                 <span>{new Date(event.date).toLocaleDateString(isTranslateOn ? 'vi-VN' : 'ja-JP')}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                 <MapPin className="w-3.5 h-3.5" />
                                 <span>{event.location}</span>
                              </div>
                           </div>

                           <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                              <div className="flex -space-x-2">
                                 <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-[#0F4186]">{(event.attendees?.length || 0)}{t('人', ' người')}</div>
                              </div>
                              <button className="flex items-center gap-2 px-6 py-2 border-2 border-slate-50 rounded-xl text-xs font-bold text-slate-600 hover:border-[#0F4186] hover:bg-blue-50/30 hover:text-[#0F4186] transition-all group/btn">
                                 <span>{t('詳細を見る', 'Xem chi tiết')}</span>
                                 <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>

               {/* Event Details (Side Card) */}
               <div className="w-full lg:w-[480px]">
                  {featuredEvent ? (
                   <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden sticky top-24">
                      <div className="relative aspect-video">
                         <img src={featuredEvent.image} className="w-full h-full object-cover" alt="" />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                         <div className="absolute bottom-6 left-8 text-white">
                            <span className="px-2 py-1 bg-rose-500 rounded text-[9px] font-bold uppercase tracking-widest mb-3 inline-block">{featuredEvent.category}</span>
                            <h2 className="text-2xl font-bold leading-tight">{featuredEvent.title}</h2>
                         </div>
                      </div>

                      <div className="p-10">
                         <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                               <img src={featuredEvent.createdBy?.profilePicture || DEFAULT_AVATAR} className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-50" alt="" />
                               <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{t('主催者', 'Người tổ chức')}</p>
                                  <p className="text-sm font-bold text-slate-900">{featuredEvent.createdBy?.fullName || t('管理者', 'Quản trị viên')}</p>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-100 transition-colors"><Share2 className="w-5 h-5" /></button>
                               <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:border-rose-200 hover:text-rose-500 transition-colors border border-transparent"><Heart className="w-5 h-5" /></button>
                            </div>
                         </div>

                         <div className="space-y-6 mb-10">
                            <div className="flex items-start gap-4">
                               <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                  <Calendar className="w-5 h-5" />
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-slate-900">{new Date(featuredEvent.date).toLocaleDateString(isTranslateOn ? 'vi-VN' : 'ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
                               </div>
                            </div>

                            <div className="flex items-start gap-4">
                               <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                                  <MapPin className="w-5 h-5" />
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-slate-900">{featuredEvent.location}</p>
                               </div>
                            </div>
                         </div>

                         <div className="bg-slate-50/50 rounded-3xl p-6 mb-10 space-y-4">
                            <h4 className="text-sm font-bold text-slate-900">{t('イベントについて • About the event', 'Giới thiệu sự kiện • About the event')}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                               {featuredEvent.description}
                            </p>
                         </div>

                         <button 
                            onClick={() => handleJoinEvent(featuredEvent._id)}
                            disabled={joining || (featuredEvent.attendees || []).includes(user.id)}
                            className="w-full py-5 bg-[#0F4186] text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
                         >
                            {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                             (featuredEvent.attendees || []).includes(user.id) ? t('参加登録済み', 'Đã đăng ký tham gia') : t('このイベントに参加する • Join', 'Tham gia sự kiện này • Join')}
                         </button>
                         <p className="text-center text-[10px] font-bold text-slate-400 mt-4">{t(`すでに${featuredEvent.attendees?.length || 0}人が申し込みました`, `Đã có ${featuredEvent.attendees?.length || 0} người đăng ký`)}</p>

                         <div className="mt-8 p-5 bg-rose-50/50 rounded-3xl border border-rose-100 flex items-start gap-4">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                              <Zap className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-rose-800 leading-none mb-1">{t('マッチしました！', 'Đã ghép cặp!')}</p>
                              <p className="text-[10px] text-rose-500 font-medium">{t('あなたの「バディ」が3人このイベントに参加予定です。', '3 "bạn đồng hành" của bạn dự kiến sẽ tham gia sự kiện này.')}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                  ) : null}
               </div>
            </div>
         </main>

         <footer className="mt-24 p-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between text-xs font-bold text-slate-400 gap-8">
            <div className="text-center md:text-left">
               <p className="text-[#0F4186] mb-1">Nihonect</p>
               <p>{t('© 2024 Nihonect. ハノイと東京を繋ぐ。', '© 2024 Nihonect. Kết nối Hà Nội và Tokyo.')}</p>
            </div>
            <div className="flex gap-12 items-center">
               <button className="hover:text-slate-600 transition-colors">{t('プライバシー', 'Quyền riêng tư')}</button>
               <button className="hover:text-slate-600 transition-colors">{t('利用規約', 'Điều khoản sử dụng')}</button>
               <button className="hover:text-slate-600 transition-colors">{t('コミュニティガイドライン', 'Hướng dẫn cộng đồng')}</button>
               <div className="flex gap-4">
                  <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Globe className="w-4 h-4" /></button>
                  <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Sparkles className="w-4 h-4" /></button>
               </div>
            </div>
         </footer>
      </div>
    </div>
  );
}

function Zap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14.899 15.346 3l-3.33 9.101h8.01L8.654 21l3.33-9.101H4Z" />
    </svg>
  );
}

function Sparkles(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v1" />
      <path d="M12 20v1" />
      <path d="M3 12h1" />
      <path d="M20 12h1" />
      <path d="m18.364 5.636-.707.707" />
      <path d="m6.343 17.657-.707.707" />
      <path d="m5.636 5.636.707.707" />
      <path d="m17.657 17.657.707.707" />
    </svg>
  );
}
