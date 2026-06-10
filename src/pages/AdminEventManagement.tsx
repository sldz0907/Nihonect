import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Tag, Trash2, Bell, Loader2, Search, Send } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function AdminEventManagement() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (eventId: string) => {
    if (!confirm('このイベントを削除してもよろしいですか？ (Bạn có chắc chắn muốn xóa sự kiện này không?)')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/events/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEvents(events.filter(e => e._id !== eventId));
      } else {
        const err = await res.json();
        alert(`エラー: ${err.message}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openNotifyModal = (eventId: string) => {
    setSelectedEventId(eventId);
    setNotifyMessage('');
    setShowNotifyModal(true);
  };

  const handleNotify = async () => {
    if (!notifyMessage.trim()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/events/${selectedEventId}/notify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ message: notifyMessage })
      });
      if (res.ok) {
        alert('参加者に通知を送信しました！ (Đã gửi thông báo cho người tham gia!)');
        setShowNotifyModal(false);
      } else {
        const err = await res.json();
        alert(`エラー: ${err.message}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = events.filter(e => 
    (e.title && e.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (e.category && e.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">イベント管理</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Event Management</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="イベントを検索..."
            className="w-80 pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-full text-sm font-bold focus:outline-none focus:border-[#0F4186] transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 text-[#0F4186] animate-spin" /></div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-20 text-center text-slate-500 font-bold">イベントが見つかりません。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">イベント名 (Sự kiện)</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">日時・場所 (Ngày/Nơi)</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">参加者 (Tham gia)</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">状態 (Trạng thái)</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">操作 (Thao tác)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEvents.map(event => {
                  const isPast = new Date(event.date) < new Date();
                  const attendeesCount = event.attendees?.length || 0;
                  
                  return (
                    <tr key={event._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img src={event.image} alt="" className="w-16 h-12 rounded-xl object-cover shadow-sm" />
                          <div>
                            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase tracking-widest mb-1">{event.category}</span>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-[#0F4186] transition-colors">{event.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-1 text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(event.date).toLocaleDateString('ja-JP')}</div>
                          <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {event.location}</div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                            <Users className="w-4 h-4 text-emerald-600" />
                          </div>
                          <p className="text-sm font-bold text-slate-900">{attendeesCount} <span className="text-slate-400 font-normal">/ {event.capacity > 0 ? event.capacity : '∞'}</span></p>
                        </div>
                      </td>
                      <td className="p-6">
                        {isPast ? (
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-widest">終了 (Đã qua)</span>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest">予定 (Sắp tới)</span>
                        )}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openNotifyModal(event._id)}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-blue-500 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm"
                            title="参加者に通知を送る (Gửi thông báo)"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(event._id)}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm"
                            title="イベントを削除 (Xóa)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notify Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">参加者に通知を送信</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                イベントの変更事項（日時、場所など）を、すでに参加登録しているユーザー全員に通知します。
              </p>
            </div>
            
            <div className="p-8">
              <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 pl-2">メッセージ内容 (Nội dung) <span className="text-rose-500">*</span></label>
              <textarea 
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                placeholder="例：天候不良のため、イベントを来週に延期します..."
                className="w-full h-32 p-5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-medium text-slate-800 resize-none"
              />
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowNotifyModal(false)}
                className="px-6 py-3 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors"
              >
                キャンセル
              </button>
              <button 
                onClick={handleNotify}
                disabled={isSubmitting || !notifyMessage.trim()}
                className="px-8 py-3 bg-[#0F4186] text-white rounded-full font-bold text-xs shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                送信する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
