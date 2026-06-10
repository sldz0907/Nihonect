import { useState } from 'react';
import { User, View } from '../types/index';
import AdminSidebar from '../components/shared/AdminSidebar';
import AdminDashboardView from './AdminDashboardView';
import AdminUserManagement from './AdminUserManagement';
import AdminEventForm from './AdminEventForm';

interface AdminLayoutProps {
  user: User;
  onLogout?: () => void;
  initialView?: View;
}

export default function AdminLayout({ user, onLogout, initialView = View.ADMIN_DASHBOARD }: AdminLayoutProps) {
  const [currentView, setCurrentView] = useState<View>(initialView);

  return (
    <div className="flex bg-[#F8FAFC] h-screen overflow-hidden">
      <AdminSidebar currentView={currentView} onNavigate={setCurrentView} onLogout={onLogout} />
      
      <div className="flex-1 overflow-y-auto">
        {currentView === View.ADMIN_DASHBOARD && <AdminDashboardView />}
        {currentView === View.ADMIN_USERS && <AdminUserManagement />}
        {currentView === View.ADMIN_EVENTS && <AdminEventForm />}
        {currentView === View.ADMIN_SETTINGS && (
          <div className="p-8 flex items-center justify-center h-full">
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm bg-white px-8 py-4 rounded-3xl shadow-sm border border-slate-100">設定画面（近日公開）</p>
          </div>
        )}
      </div>
    </div>
  );
}
