import { useState, useEffect } from 'react';
import { User, View } from '../types/index';
import { 
  ShieldAlert, 
  Filter, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Ban, 
  Eye,
  Info,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search
} from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';

interface ReportQueueViewProps {
  user: User;
  onNavigate: (view: View) => void;
  onLogout?: () => void;
}

export default function ReportQueueView({ user, onNavigate, onLogout }: ReportQueueViewProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId: string, status: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/reports/${reportId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('このユーザーをバンしますか？ (Bạn có chắc chắn muốn khóa người dùng này?)')) return;
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: 'banned' })
      });
      if (res.ok) {
        alert('ユーザーをバンしました。(Đã khóa người dùng.)');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] h-screen overflow-hidden">
      <Sidebar currentView={View.REPORT_QUEUE} onNavigate={onNavigate} onLogout={onLogout} role="ADMIN" />
      
      <div className="flex-1 overflow-y-auto">
        <header className="p-10 pb-4">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-extrabold text-[#0F4186] tracking-tight mb-2">通報キュー</h1>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">違反管理 — 24件のコミュニティ安全通報が保留中です。</p>
              </div>
              <div className="flex gap-3">
                 <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
                    <Filter className="w-4 h-4" />
                    <span>フィルター</span>
                 </button>
                 <button className="flex items-center gap-2 px-6 py-3 bg-[#0F4186] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all">
                    <RotateCw className="w-4 h-4" />
                    <span>キューを更新</span>
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">保留中</p>
                 <h2 className="text-5xl font-black text-[#0F4186]">24</h2>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">本日の解決済み</p>
                 <h2 className="text-5xl font-black text-slate-900">142</h2>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
              </div>
           </div>
        </header>

        <main className="px-10 pb-20">
           <section className="bg-white rounded-[44px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic border-b border-slate-50">
                          <th className="text-left py-6 px-10">通報詳細</th>
                          <th className="text-left py-6 px-10">関係者</th>
                          <th className="text-left py-6 px-10">ステータス</th>
                          <th className="text-right py-6 px-10">アクション</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {reports.map((report) => (
                         <tr key={report._id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-8 px-10 max-w-sm">
                               <div className="flex flex-col items-start gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                    report.severity === 'high' ? 'bg-rose-500 text-white' : 
                                    report.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                     {report.type} • {new Date(report.createdAt).toLocaleDateString()}
                                  </span>
                                  <p className="text-xs text-slate-600">「{report.description}」</p>
                               </div>
                            </td>
                            <td className="py-8 px-10">
                               <div className="flex items-center gap-3">
                                  <div className="text-right">
                                     <p className="text-[9px] font-bold text-slate-300 uppercase leading-none mb-1">通報者</p>
                                     <p className="text-xs font-bold text-slate-700">{report.reporter?.fullName || 'Unknown'}</p>
                                  </div>
                                  <ArrowRightIcon className="w-4 h-4 text-slate-200" />
                                  <div className="text-left">
                                     <p className="text-[9px] font-bold text-rose-300 uppercase leading-none mb-1">対象者</p>
                                     <p className="text-xs font-bold text-rose-950">{report.reportedUser?.fullName || 'Unknown'}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="py-8 px-10">
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-max ${
                                 report.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 
                                 report.status === 'dismissed' ? 'bg-slate-100 text-slate-500' : 'bg-purple-50 text-purple-600'
                               }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    report.status === 'resolved' ? 'bg-emerald-400' : 
                                    report.status === 'dismissed' ? 'bg-slate-300' : 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                                  }`} />
                                  {report.status.toUpperCase()}
                               </span>
                            </td>
                            <td className="py-8 px-10 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleUpdateStatus(report._id, 'resolved')} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors" title="Resolve">
                                     <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleUpdateStatus(report._id, 'dismissed')} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors" title="Dismiss">
                                     <Trash2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleBanUser(report.reportedUser?._id)} className="p-2 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-100 hover:text-rose-600 transition-all" title="Ban User">
                                     <Ban className="w-4 h-4" />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       ))}
                       {reports.length === 0 && (
                         <tr>
                           <td colSpan={4} className="py-12 text-center text-slate-400">
                             現在通報はありません。(Hiện tại không có báo cáo nào.)
                           </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>

              <div className="p-8 border-t border-slate-50 flex items-center justify-between">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">24件中 1-3件を表示中</p>
                 <div className="flex gap-2">
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-100 transition-all"><ChevronRight className="w-5 h-5" /></button>
                 </div>
              </div>
           </section>

           {/* Guidelines Banner */}
           <div className="mt-12 bg-blue-50 rounded-[44px] p-10 flex items-start gap-8 relative overflow-hidden group">
              <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-xl shadow-blue-900/5 group-hover:scale-110 transition-transform">
                 <ShieldAlert className="w-10 h-10 text-[#0F4186]" />
              </div>
              <div className="relative z-10">
                 <h4 className="text-xl font-extrabold text-[#0F4186] mb-4">コミュニティガイドライン</h4>
                 <p className="text-sm text-slate-600 max-w-2xl leading-relaxed mb-6">
                    ユーザーの安全と文化的背景を常に優先してください。最終的な処置を決定する前に、日本とベトナム両方の文脈を考慮してください。判断に迷う場合は、上位管理者に転送してください。
                 </p>
                 <button className="text-xs font-black text-[#0F4186] uppercase tracking-[0.2em] hover:underline flex items-center gap-2">
                    管理者規約を確認する <ExternalLink className="w-4 h-4" />
                 </button>
              </div>
              
              {/* Decorative circle */}
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
           </div>
        </main>

        <footer className="p-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between opacity-50 gap-8">
           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Nihonect <span className="font-light">© 2024 NichiViet Connect. ハノイと東京を繋ぐ。</span>
           </div>
           <div className="flex gap-12 font-black uppercase tracking-widest text-[9px] text-slate-400">
              <button className="hover:text-[#0F4186]">利用規約</button>
              <button className="hover:text-[#0F4186]">コミュニティ規定</button>
           </div>
        </footer>
      </div>
    </div>
  );
}

function ArrowRightIcon(props: any) {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
