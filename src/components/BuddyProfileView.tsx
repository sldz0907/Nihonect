import { useState, useEffect } from 'react';
import { View, DEFAULT_AVATAR } from '../types';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  MessageSquare, 
  MapPin, 
  Star,
  Globe,
  Award,
  Languages
} from 'lucide-react';
import { motion } from 'motion/react';
import Sidebar from './shared/Sidebar';

interface BuddyProfileViewProps {
  buddyId: string;
  onBack: () => void;
  onNavigate: (view: View) => void;
  onLogout?: () => void;
}

export default function BuddyProfileView({ buddyId, onBack, onNavigate, onLogout }: BuddyProfileViewProps) {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`/api/users/profile/${buddyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [buddyId]);

  if (isLoading || !profileData) {
    return (
      <div className="flex bg-[#F8FAFC] h-screen overflow-hidden">
        <Sidebar currentView={View.BUDDIES} onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0F4186] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const { profile, reviews } = profileData;
  const avatarUrl = profile.profilePicture || DEFAULT_AVATAR;

  return (
    <div className="flex bg-[#F8FAFC] h-screen overflow-hidden">
      <Sidebar currentView={View.BUDDIES} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-100">
           <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h1 className="text-xl font-bold text-[#0F4186]">Nihonect</h1>
           </div>
           <div className="flex items-center gap-3">
              <button className="p-2.5 hover:bg-slate-100 rounded-full transition-colors">
                <Share2 className="w-5 h-5 text-slate-500" />
              </button>
           </div>
        </header>

        <main className="max-w-4xl mx-auto p-8">
          <div className="relative mb-24">
            <div className="h-64 w-full bg-gradient-to-r from-blue-600 to-indigo-900 rounded-[40px] overflow-hidden relative shadow-xl shadow-blue-900/10">
               <img src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1200&h=400&fit=crop" className="w-full h-full object-cover opacity-30" alt="" />
               <div className="absolute bottom-6 right-8 bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/20 flex flex-col items-center">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={176} strokeDashoffset={176 * (1 - profile.matchPercentage/100)} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                     </svg>
                     <span className="absolute text-xs font-black text-white">{profile.matchPercentage}%</span>
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest mt-2">Match</span>
               </div>
            </div>

            <div className="absolute -bottom-16 left-10 flex items-end gap-8">
              <div className="relative">
                <img src={avatarUrl} className="w-40 h-40 rounded-[48px] border-[8px] border-white shadow-2xl object-cover bg-white" alt={profile.fullName} />
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
              </div>
              <div className="mb-6 pb-2">
                <h2 className="text-4xl font-extrabold text-slate-900 mb-2 truncate max-w-sm">{profile.fullName}</h2>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  {profile.livingArea && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#0F4186]" />
                      <span>{profile.livingArea}</span>
                    </div>
                  )}
                  {(profile.japaneseLevel || profile.vietnameseLevel) && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-[#0F4186]" />
                      <span>{profile.japaneseLevel} {profile.japaneseLevel && profile.vietnameseLevel && '/'} {profile.vietnameseLevel}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 right-0 flex gap-4">
               <button className="flex items-center gap-2 px-8 py-4 bg-[#0F4186] text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                  <Heart className="w-5 h-5 fill-current" />
                  <span>つながる</span>
               </button>
               <button 
                 onClick={() => onNavigate(View.MESSAGES)}
                 className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
               >
                  <MessageSquare className="w-5 h-5" />
                  <span>メッセージを送る</span>
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
             <div className="lg:col-span-2 space-y-8">
                <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0F4186]/20 group-hover:bg-[#0F4186] transition-colors" />
                   <div className="flex items-center gap-3 mb-6">
                      <CircleUserIcon className="w-6 h-6 text-[#0F4186]" />
                      <h3 className="text-xl font-bold text-slate-900">自己紹介</h3>
                   </div>
                   <p className="text-slate-600 leading-relaxed text-lg mb-8 whitespace-pre-wrap">
                      {profile.bio || "まだ自己紹介がありません。"}
                   </p>
                   {profile.interests && profile.interests.length > 0 && (
                     <div className="space-y-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">興味・関心</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.interests.map((tag: string, i: number) => (
                            <span key={tag} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${i === 2 ? 'bg-blue-50 text-[#0F4186] border border-blue-100' : 'bg-slate-50 text-slate-500 border border-transparent'}`}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                     </div>
                   )}
                </section>

                <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                         <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                         <h3 className="text-xl font-bold text-slate-900">評価とレビュー</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100">
                          <span className="text-lg font-black text-amber-600">{profile.avgRating || 0}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= profile.avgRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />)}
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-400">({profile.reviewCount}件)</span>
                      </div>
                   </div>

                   <div className="space-y-6">
                      {reviews.length === 0 ? (
                        <div className="text-center text-slate-400 py-4">まだレビューがありません。</div>
                      ) : (
                        reviews.map((rev: any) => (
                          <div key={rev.id} className="p-6 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white transition-all">
                             <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                   <img src={rev.reviewerAvatar || DEFAULT_AVATAR} className="w-10 h-10 rounded-full object-cover bg-white" alt="" />
                                   <div>
                                      <p className="text-sm font-bold text-slate-900">{rev.reviewerName}</p>
                                      <div className="flex">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-2.5 h-2.5 ${i <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />)}
                                      </div>
                                   </div>
                                </div>
                                <span className="text-[10px] font-medium text-slate-400 uppercase">{new Date(rev.date).toLocaleDateString()}</span>
                             </div>
                             <p className="text-sm text-slate-600 leading-relaxed">{rev.text}</p>
                          </div>
                        ))
                      )}

                      <button 
                         onClick={() => onNavigate(View.REVIEW)}
                         className="w-full py-4 text-sm font-bold text-[#0F4186] border-2 border-[#0F4186] rounded-2xl hover:bg-[#0F4186] hover:text-white transition-all mt-4"
                      >
                         レビューを書く
                      </button>
                   </div>
                </section>
             </div>

             <div className="space-y-8">
                <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative group overflow-hidden">
                   <div className="flex items-center gap-3 mb-8">
                      <Languages className="w-6 h-6 text-[#0F4186]" />
                      <h3 className="text-xl font-bold text-slate-900">言語スキル</h3>
                   </div>
                   <div className="space-y-8">
                      {profile.japaneseLevel && (
                        <div className="space-y-2">
                           <div className="flex justify-between items-end">
                              <p className="text-sm font-bold text-slate-900">日本語</p>
                              <p className="text-[10px] font-black uppercase text-[#0F4186] tracking-wider">{profile.japaneseLevel}</p>
                           </div>
                           <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '80%' }}
                                className="h-full bg-[#0F4186] rounded-full"
                              />
                           </div>
                        </div>
                      )}
                      {profile.vietnameseLevel && (
                        <div className="space-y-2">
                           <div className="flex justify-between items-end">
                              <p className="text-sm font-bold text-slate-900">ベトナム語</p>
                              <p className="text-[10px] font-black uppercase text-[#0F4186] tracking-wider">{profile.vietnameseLevel}</p>
                           </div>
                           <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '80%' }}
                                className="h-full bg-[#0F4186] rounded-full"
                              />
                           </div>
                        </div>
                      )}
                      {!profile.japaneseLevel && !profile.vietnameseLevel && (
                        <p className="text-sm text-slate-400">言語スキルが設定されていません。</p>
                      )}
                   </div>
                </section>

                <div className="bg-[#0F4186] p-8 rounded-[32px] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                  <div className="relative z-10">
                    <Award className="w-12 h-12 mb-6 text-blue-200/50" />
                    <h4 className="text-xl font-bold mb-2">コミュニティメンバー</h4>
                    <p className="text-blue-100/60 text-sm mb-6">コミュニティに参加して、言語交換を楽しんでいます。</p>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function CircleUserIcon(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19c0-1.657 3.134-3 7-3 3.866 0 7 1.343 7 3v1.662" />
    </svg>
  );
}
