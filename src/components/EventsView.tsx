import { useState, useEffect } from 'react';
import { User, View, DEFAULT_AVATAR } from '../types';
import { Search, Calendar, MapPin, Users, Heart, Share2, Info, ChevronRight, Globe, Bookmark, Loader2, Languages } from 'lucide-react';
import Sidebar from './shared/Sidebar';

interface EventsViewProps {
  user: User;
  onNavigate: (view: View) => void;
  onLogout?: () => void;
  isTranslateOn: boolean;
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

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
