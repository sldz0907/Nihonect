import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { DEFAULT_AVATAR } from '../../types';

interface AppNotification {
  id: string;
  name: string;
  avatar: string | null;
  type?: string;
  message?: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/users/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.requests || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = async (id: string, action: 'accept' | 'decline') => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/users/${action}/${id}`, {
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
      const res = await fetch(`/api/notifications/${id}/read`, {
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
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
      >
        {notifications.length > 0 && (
          <div className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></div>
        )}
        <Bell className="w-5 h-5 text-slate-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">通知 ({notifications.length})</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                新しい通知はありません
              </div>
            ) : (
              notifications.map(req => (
                <div key={req.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 items-center">
                  {req.type === 'new_event' ? (
                     <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#0F4186] flex-shrink-0">
                       <Bell className="w-5 h-5" />
                     </div>
                  ) : (
                     <img src={req.avatar || DEFAULT_AVATAR} className="w-10 h-10 rounded-full object-cover" alt={req.name} />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{req.name}</p>
                    <p className="text-xs text-slate-500">{req.type === 'new_event' ? req.message : 'バディリクエスト'}</p>
                  </div>

                  {req.type === 'new_event' ? (
                     <button 
                        onClick={() => handleReadEventNotification(req.id)}
                        className="text-xs text-blue-600 font-bold p-2 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
                     >
                        既読
                     </button>
                  ) : (
                     <div className="flex gap-1">
                        <button 
                          onClick={() => handleAction(req.id, 'accept')}
                          className="p-1.5 bg-[#0F4186] text-white rounded-lg hover:bg-[#0D3875] transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'decline')}
                          className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                     </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
