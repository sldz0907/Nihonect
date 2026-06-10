import { useNavigate } from 'react-router-dom';
import { View } from '../../types';
import {
  LayoutDashboard, 
  Users, 
  CalendarPlus, 
  CalendarDays,
  LogOut
} from 'lucide-react';
import { logout } from '../../services/authApi';

interface AdminSidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout?: () => void;
}

export default function AdminSidebar({ currentView, onNavigate, onLogout }: AdminSidebarProps) {
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
    { id: View.ADMIN_DASHBOARD, label: 'システム概要', icon: LayoutDashboard },
    { id: View.ADMIN_USERS, label: 'ユーザー管理', icon: Users },
    { id: View.ADMIN_EVENTS, label: 'イベント作成', icon: CalendarPlus },
    { id: View.ADMIN_EVENT_MANAGEMENT, label: 'イベント管理', icon: CalendarDays },
  ];

  return (
    <div className="w-[280px] bg-[#0F4186] text-white h-full flex flex-col p-8 shadow-2xl relative z-20">
      <div className="mb-16 mt-4">
        <h1 className="text-3xl font-black tracking-tighter">Nihonect</h1>
        <p className="text-[10px] text-blue-300 font-black tracking-[0.3em] uppercase mt-2">Admin Portal</p>
      </div>

      <nav className="flex-1 space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] transition-all font-bold text-sm ${
                isActive 
                  ? 'bg-white text-[#0F4186] shadow-xl shadow-black/10 translate-x-2' 
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#0F4186]' : 'text-blue-300'}`} />
              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="pt-10 border-t border-blue-800/50 space-y-2">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-[20px] text-blue-200 hover:text-rose-400 hover:bg-rose-500/10 transition-all font-bold text-sm"
        >
          <LogOut className="w-5 h-5 opacity-70" />
          <span className="tracking-wide">ログアウト</span>
        </button>
      </div>
      
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-linear-to-t from-[#0a2e5c] to-transparent pointer-events-none" />
    </div>
  );
}
