import { useState } from 'react';
import { User, View } from '../types/index';
import AdminSidebar from '../components/shared/AdminSidebar';
import AdminDashboardView from './AdminDashboardView';
import AdminUserManagement from './AdminUserManagement';
import AdminEventForm from './AdminEventForm';
import AdminEventManagement from './AdminEventManagement';
import ReportQueueView from './ReportQueueView';

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
        {currentView === View.ADMIN_EVENT_MANAGEMENT && <AdminEventManagement />}
        {currentView === View.REPORT_QUEUE && <ReportQueueView user={user} onNavigate={setCurrentView} onLogout={onLogout} />}
      </div>
    </div>
  );
}
