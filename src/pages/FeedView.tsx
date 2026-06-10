import { useEffect, useState, useRef } from 'react';
import { User, View, Buddy, DEFAULT_AVATAR } from '../types/index';
import { Search, Zap, Heart, MapPin, ChevronRight, ChevronLeft, Calendar, Languages } from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import NotificationBell from '../components/shared/NotificationBell';

const livingAreaMap: Record<string, string> = {
  'Ba Dinh': 'バーディン区',
  'Hoan Kiem': 'ホアンキエム区',
  'Hai Ba Trung': 'ハイバーチュン区',
  'Dong Da': 'ドンダー区',
  'Tay Ho': 'タイホー区',
  'Cau Giay': 'カウザイ区',
  'Thanh Xuan': 'タインスアン区',
  'Ha Dong': 'ハドン区',
  'Bac Tu Liem': 'バクトゥーリエム区',
  'Nam Tu Liem': 'ナムトゥーリエム区',
  'My Duc': 'ミーデュック県',
  'Dan Phuong': 'ダンフォン県',
  'Thuong Tin': 'トゥオンティン県',
  'Hoai Duc': 'ホアイドゥック県',
  'Quoc Oai': 'クォックオアイ県',
  'Phu Xuyen': 'フーズエン県',
  'Soc Son': 'ソックソン県',
  'Me Linh': 'メーリン県'
};

const livingAreaMapVi: Record<string, string> = {
  'Ba Dinh': 'Quận Ba Đình',
  'Hoan Kiem': 'Quận Hoàn Kiếm',
  'Hai Ba Trung': 'Quận Hai Bà Trưng',
  'Dong Da': 'Quận Đống Đa',
  'Tay Ho': 'Quận Tây Hồ',
  'Cau Giay': 'Quận Cầu Giấy',
  'Thanh Xuan': 'Quận Thanh Xuân',
  'Ha Dong': 'Quận Hà Đông',
  'Bac Tu Liem': 'Quận Bắc Từ Liêm',
  'Nam Tu Liem': 'Quận Nam Từ Liêm',
  'My Duc': 'Huyện Mỹ Đức',
  'Dan Phuong': 'Huyện Đan Phượng',
  'Thuong Tin': 'Huyện Thường Tín',
  'Hoai Duc': 'Huyện Hoài Đức',
  'Quoc Oai': 'Huyện Quốc Oai',
  'Phu Xuyen': 'Huyện Phú Xuyên',
  'Soc Son': 'Huyện Sóc Sơn',
  'Me Linh': 'Huyện Mê Linh'
};

interface FeedViewProps {
  user: User;
  onNavigate: (view: View) => void;
  onSelectBuddy: (id: string) => void;
  onLogout?: () => void;
  isTranslateOn: boolean;
  onToggleTranslate: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function FeedView({ user, onNavigate, onSelectBuddy, onLogout, isTranslateOn, onToggleTranslate }: FeedViewProps) {
  const [buddies, setBuddies] = useState<(Buddy & { isRequested?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ newMatchesCount: 0, activeCommunityCount: 0, nearbyUsersCount: 0, friendsCount: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const [recRes, statsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/users/recommendations`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/users/dashboard-stats`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (recRes.ok) {
          const data = await recRes.json();
          setBuddies(data.buddies || []);
        }
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const handleConnect = async (targetUserId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/users/request/${targetUserId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setBuddies(prev => prev.map(b => b.id === targetUserId ? { ...b, isRequested: true } : b));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const t = (ja: string, vi: string) => (isTranslateOn ? vi : ja);

  return (
    <div className="flex bg-[#F8FAFC] h-screen overflow-hidden">
      <Sidebar currentView={View.FEED} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#F8FAFC]/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-100">
          <div className="w-96 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('バディを検索...', 'Tìm kiếm bạn bè...')}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#0F4186] focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            {/* Translation Switch */}
            <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
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
            <button 
              onClick={() => onNavigate(View.PROFILE_SETTINGS)}
              className="flex items-center gap-3 pl-3 pr-1 py-1 bg-white border border-slate-200 rounded-full hover:border-[#0F4186] transition-all group"
            >
              <span className="text-xs font-bold text-slate-700">{user.name}</span>
              <img src={user.profilePicture || DEFAULT_AVATAR} className="w-8 h-8 rounded-full object-cover border border-slate-200" alt="Profile" />
            </button>
          </div>
        </header>

        <main className="p-8 max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('こんにちは！', 'Xin chào!')}</h1>
            <p className="text-slate-500">{t('今日、ハノイで最高の文化の架け橋を見つけましょう。', 'Hôm nay, hãy cùng tìm kiếm cầu nối văn hóa tốt nhất tại Hà Nội.')}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {[
              { icon: Zap, label: t('スマートマッチ', 'Ghép đôi thông minh'), value: t(`${stats.newMatchesCount}件の新しいマッチ`, `${stats.newMatchesCount} gợi ý mới`), color: 'blue' },
              { icon: Heart, label: t('コミュニティ', 'Cộng đồng'), value: t(`つながっているバディ ${stats.friendsCount}名`, `Đã kết nối với ${stats.friendsCount} bạn bè`), color: 'rose', onClick: () => onNavigate(View.BUDDIES) },
              { icon: MapPin, label: t('場所', 'Địa điểm'), value: (user.livingArea ? ((isTranslateOn ? livingAreaMapVi[user.livingArea] : livingAreaMap[user.livingArea]) || user.livingArea) : '') || user.location || t('未設定', 'Chưa thiết lập'), color: 'indigo' },
            ].map((stat, i) => (
              <div 
                key={i} 
                onClick={stat.onClick}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:border-blue-200 transition-colors cursor-pointer group"
              >
                <div className={`p-4 rounded-xl inline-flex items-center justify-center ${
                  stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                  stat.color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-slate-800 font-bold whitespace-nowrap">{stat.value}</p>
                  {stat.subText && (
                    <p className="text-[10px] text-slate-500 mt-1">{stat.subText}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recommended Buddies */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">{t('おすすめのバディ', 'Bạn bè đề xuất')}</h2>
              <button className="text-sm font-bold text-[#0F4186] hover:underline flex items-center gap-1">
                {t('すべてのアクティビティを見る', 'Xem tất cả hoạt động')} <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative group/slider">
              <button 
                onClick={scrollLeft} 
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-10 w-12 h-12 bg-white rounded-full shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#0F4186] opacity-0 group-hover/slider:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-6 h-6 ml-[-2px]" />
              </button>
              <button 
                onClick={scrollRight} 
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-10 w-12 h-12 bg-white rounded-full shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#0F4186] opacity-0 group-hover/slider:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-6 h-6 mr-[-2px]" />
              </button>
              
              <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {isLoading ? (
                  <div className="w-full py-12 text-center text-slate-500">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    {t('おすすめ of buddyを探しています...', 'Đang tìm kiếm bạn bè phù hợp...')}
                  </div>
              ) : buddies.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{t('まだバディが見つかりません', 'Chưa tìm thấy bạn bè nào')}</h3>
                  <p className="text-slate-500 mb-6">
                    {t('Currently no users found. Be the first to invite your friends!', 'Hiện chưa tìm thấy người dùng nào. Hãy là người đầu tiên mời bạn bè của bạn!')}
                  </p>
                  <button className="px-6 py-2.5 bg-[#0F4186] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-[#0D3875] transition-colors">
                    {t('友達を招待する', 'Mời bạn bè')}
                  </button>
                </div>
              ) : (
                buddies.map((buddy) => (
                  <div key={buddy.id} className="min-w-[280px] md:min-w-[320px] max-w-[320px] snap-start bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group flex flex-col h-full shrink-0">
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      <img src={buddy.avatar || DEFAULT_AVATAR} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={buddy.name} />
                      <div className="absolute top-4 left-4 bg-slate-900/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{buddy.role}</span>
                      </div>
                      <div className="absolute top-4 right-4 bg-blue-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg shadow-blue-500/20">
                        {buddy.matchPercentage}% {t('マッチ', 'Phù hợp')}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{buddy.name}</h3>
                        <p className="text-xs text-slate-500">{buddy.location ? (isTranslateOn ? livingAreaMapVi[buddy.location] || buddy.location : livingAreaMap[buddy.location] || buddy.location) : ''}</p>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-6 flex-1">
                        {buddy.bio}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {buddy.tags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold">{t(tag, tag)}</span>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <button 
                           onClick={() => onSelectBuddy(buddy.id)}
                           className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                           {t('詳細を見る', 'Xem chi tiết')}
                        </button>
                        <button 
                          onClick={() => handleConnect(buddy.id)}
                          disabled={buddy.isRequested}
                          className={`flex-1 py-2.5 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                            buddy.isRequested 
                              ? 'bg-slate-200 text-slate-500 shadow-none cursor-not-allowed' 
                              : 'bg-[#0F4186] text-white hover:bg-[#0D3875] shadow-blue-500/10'
                          }`}
                        >
                          {buddy.isRequested ? (
                            t('リクエスト済み', 'Đã gửi yêu cầu')
                          ) : (
                            <>
                              <Heart className="w-3.5 h-3.5" />
                              {t('つながる', 'Kết nối')}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              </div>
            </div>
          </section>

          {/* Events Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <span className="px-4 py-2 bg-white rounded-full text-xs font-bold text-[#0F4186] border border-slate-100 shadow-sm">{t('トレンドイベント', 'Sự kiện nổi bật')}</span>
            </div>
            <div className="relative bg-[#0F4186] rounded-[32px] overflow-hidden group cursor-pointer shadow-2xl shadow-blue-900/20">
              <div className="absolute inset-0 opacity-20">
                <img src="https://images.unsplash.com/photo-1514525253361-bee8718a300c?w=1200&h=600&fit=crop" className="w-full h-full object-cover" alt="Event" />
              </div>
              <div className="relative p-10 z-10 text-white flex gap-12 items-center">
                <div className="flex-1">
                  <div className="inline-flex px-3 py-1 bg-rose-500 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">{t('言語ミートアップ', 'Gặp gỡ ngôn ngữ')}</div>
                  <h2 className="text-3xl font-bold mb-4 leading-tight">{t('日越言語交流ナイト 2024', 'Đêm giao lưu ngôn ngữ Nhật - Việt 2024')}</h2>
                  <p className="text-blue-100/70 mb-8 max-w-lg">{t('100人以上のバディと一緒に、寿司や春巻きを楽しみながら会話を弾ませましょう！', 'Cùng trò chuyện vui vẻ với hơn 100 người bạn trong khi thưởng thức sushi và nem cuốn!')}</p>
                  
                  <div className="flex items-center gap-8 text-sm text-blue-100/60 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{t('12月15日, 18:00', '18:00, Ngày 15 tháng 12')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{t('ハノイ, ロッテセンター', 'Lotte Center, Hà Nội')}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                   onClick={() => onNavigate(View.EVENTS)}
                   className="bg-white text-[#0F4186] px-10 py-4 rounded-2xl font-extrabold shadow-xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider"
                >
                  {t('予約する', 'Đặt chỗ')}
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-12 p-8 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400">
          <p>{t('© 2024 Nihonect. ハノイの日本・ベトナムコミュニティ。', '© 2024 Nihonect. Cộng đồng Nhật - Việt tại Hà Nội.')}</p>
          <div className="flex gap-8">
            <button className="hover:text-slate-600">{t('利用規約', 'Điều khoản sử dụng')}</button>
            <button className="hover:text-slate-600">{t('プライバシーポリシー', 'Chính sách bảo mật')}</button>
            <button className="hover:text-slate-600">{t('お問い合わせ', 'Liên hệ')}</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
