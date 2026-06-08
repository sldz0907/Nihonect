import { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Trash2, Ban, CheckCircle, Search, Filter } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    if (!window.confirm(`本当にこのユーザーを${newStatus === 'banned' ? '凍結' : '有効化'}しますか？`)) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('このユーザーを完全に削除しますか？この操作は元に戻せません。')) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = users.filter(u => {
    const nameMatch = 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && u.status !== 'banned') || 
      (statusFilter === 'banned' && u.status === 'banned');
      
    return nameMatch && statusMatch;
  });

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">ユーザー管理</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">User Management</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0F4186]" />
            <input 
              type="text" 
              placeholder="ユーザーを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-72 pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-[#0F4186] outline-none transition-all text-sm font-medium shadow-sm"
            />
          </div>
          
          <div className="relative" ref={filterDropdownRef}>
            <button 
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`flex items-center gap-2 px-5 py-3 border rounded-2xl text-sm font-bold transition-all shadow-sm ${
                statusFilter !== 'all' 
                  ? 'bg-[#0F4186]/10 border-[#0F4186]/20 text-[#0F4186] hover:bg-[#0F4186]/20' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>
                {statusFilter === 'all' && '絞り込み'}
                {statusFilter === 'active' && 'ステータス: 有効'}
                {statusFilter === 'banned' && 'ステータス: 凍結中'}
              </span>
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">
                  ステータス
                </div>
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                    statusFilter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    すべて
                  </span>
                  {statusFilter === 'all' && <CheckCircle className="w-4 h-4 text-slate-600" />}
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('active');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                    statusFilter === 'active' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    有効 (Active)
                  </span>
                  {statusFilter === 'active' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('banned');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                    statusFilter === 'banned' ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    凍結中 (Banned)
                  </span>
                  {statusFilter === 'banned' && <CheckCircle className="w-4 h-4 text-rose-600" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-400 font-bold">読み込み中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left py-5 px-8">ユーザー</th>
                  <th className="text-left py-5 px-8">役割</th>
                  <th className="text-left py-5 px-8">ステータス</th>
                  <th className="text-right py-5 px-8">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((u: any) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <img src={u.profilePicture || "https://i.pravatar.cc/100?img=1"} className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm" alt="" />
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">{u.fullName}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {u.role === 'admin' ? '管理者' : '一般ユーザー'}
                      </span>
                    </td>
                    <td className="py-5 px-8">
                      <span className={`flex items-center gap-2 w-fit px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${u.status === 'banned' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'banned' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        {u.status === 'banned' ? '凍結中' : '有効'}
                      </span>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex items-center justify-end gap-2">
                        {u.role !== 'admin' && (
                          <>
                            <button 
                              onClick={() => handleToggleStatus(u._id, u.status || 'active')}
                              className={`p-2.5 rounded-xl transition-all ${u.status === 'banned' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                              title={u.status === 'banned' ? '有効化' : '凍結'}
                            >
                              {u.status === 'banned' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => handleDelete(u._id)}
                              className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                              title="削除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400 font-bold text-sm">ユーザーが見つかりません。</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
