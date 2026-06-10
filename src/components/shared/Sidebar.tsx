import { useNavigate } from 'react-router-dom';
import { View } from '../../types';
import { 
  LayoutGrid, 
  MessageSquare, 
  Calendar, 
  Users, 
  HelpCircle, 
  LogOut, 
  Settings,
  CircleUser
} from 'lucide-react';
import { logout } from '../../services/authApi';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout?: () => void;
  role?: string;
}

export default function Sidebar({ currentView, onNavigate, onLogout, role }: SidebarProps) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  const menuItems = [
    { id: View.FEED, label: 'フィード', icon: LayoutGrid },
    { id: View.MESSAGES, label: 'メッセージ', icon: MessageSquare },
    { id: View.EVENTS, label: 'イベント', icon: Calendar },
    { id: View.BUDDIES, label: 'バディ', icon: Users },
  ];

  if (role === 'ADMIN') {
    menuItems.push(
      { id: View.ADMIN_DASHBOARD, label: 'システム管理', icon: Settings },
      { id: View.REPORT_QUEUE, label: '通報キュー', icon: HelpCircle }
    );
  } else {
    menuItems.push(
      { id: View.PROFILE_SETTINGS, label: 'プロフィール', icon: CircleUser }
    );
  }

  return (
    <div className="w-[240px] bg-white border-r border-slate-100 h-full flex flex-col p-6">
      <div className="mb-10 pl-2">
        <h1 className="text-xl font-bold text-[#0F4186]">Nihonect</h1>
        <p className="text-[10px] text-slate-400 font-medium tracking-wider">日本とベトナムを繋ぐ</p>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-50 text-[#0F4186] font-bold shadow-sm shadow-blue-500/5' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#0F4186]' : 'text-slate-400'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="pt-8 border-t border-slate-100 space-y-1">

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-600" />
          <span className="text-sm">ログアウト</span>
        </button>
      </div>
    </div>
  );
}
