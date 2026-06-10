import { useState, useEffect } from 'react';
import { Bell, Check, X, Loader2 } from 'lucide-react';
import { DEFAULT_AVATAR } from '../types';

interface AppNotification {
  id: string;
  name: string;
  avatar: string | null;
  type?: string;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/users/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.requests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'accept' | 'decline') => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/users/${action}/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(r => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReadEventNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">通知</h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Notifications</p>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#0F4186] animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold text-lg text-slate-600">新しい通知はありません</p>
            <p className="text-sm text-slate-400 mt-2">No new notifications</p>
          </div>
        ) : (
          <div className="overflow-y-auto p-6 space-y-4">
            {notifications.map(req => (
              <div key={req.id} className="p-6 bg-slate-50 rounded-[24px] flex flex-col sm:flex-row gap-6 items-start sm:items-center border border-slate-100/50 hover:bg-slate-100/50 transition-colors">
                {req.type === 'new_event' ? (
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-[#0F4186] flex-shrink-0 shadow-sm">
                    <Bell className="w-6 h-6" />
                  </div>
                ) : (
                  <img src={req.avatar || DEFAULT_AVATAR} className="w-14 h-14 rounded-full object-cover shadow-sm" alt={req.name} />
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-slate-900 truncate mb-1">{req.name}</p>
                  <p className="text-sm text-slate-500 bg-white px-4 py-3 rounded-2xl border border-slate-100 inline-block shadow-sm">
                    {req.type === 'new_event' ? req.message : 'バディリクエストが届きました (Yêu cầu kết bạn mới)'}
                  </p>
                </div>

                <div className="flex shrink-0 w-full sm:w-auto">
                  {req.type === 'new_event' ? (
                    <button 
                      onClick={() => handleReadEventNotification(req.id)}
                      className="w-full sm:w-auto px-6 py-3 bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 rounded-xl transition-colors whitespace-nowrap shadow-sm"
                    >
                      既読にする (Đã hiểu)
                    </button>
                  ) : (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleAction(req.id, 'accept')}
                        className="flex-1 sm:flex-none px-6 py-3 bg-[#0F4186] text-white rounded-xl hover:bg-[#0D3875] transition-colors shadow-sm font-bold flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" /> 承認
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, 'decline')}
                        className="flex-1 sm:flex-none px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-bold flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" /> 拒否
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
