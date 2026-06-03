import { useState, useEffect } from 'react';
import {
   Users,
   Calendar,
   Zap,
   AlertCircle,
   ArrowUpRight,
   ArrowDownRight,
   RotateCcw,
   Download
} from 'lucide-react';

export default function AdminDashboardView() {
   const [dashboardData, setDashboardData] = useState<{stats: any, logs: any[]}>({ stats: null, logs: [] });
   
   useEffect(() => {
      const fetchStats = async () => {
         try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/admin/stats', {
               headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
               const data = await res.json();
               setDashboardData({ stats: data.stats, logs: data.recentLogs });
            }
         } catch (e) {
            console.error('Failed to fetch admin stats:', e);
         }
      };
      fetchStats();
   }, []);

   const formatTime = (isoString: string) => {
      const date = new Date(isoString);
      const diffInMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
      if (diffInMinutes < 1) return 'たった今';
      if (diffInMinutes < 60) return `${diffInMinutes}分前`;
      if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)}時間前`;
      return `${Math.floor(diffInMinutes / (24 * 60))}日前`;
   };

   const stats = [
      { label: '総ユーザー数', value: dashboardData.stats?.totalUsers ?? '...', sub: 'Total Users', change: '+12.5%', icon: Users, color: 'blue' },
      { label: '開催中のイベント', value: dashboardData.stats?.activeEvents ?? '...', sub: 'Active Events', change: '+4.2%', icon: Calendar, color: 'green' },
      { label: '新規マッチング', value: dashboardData.stats?.newMatches ?? '...', sub: 'New Matches', change: '+8.1%', icon: Zap, color: 'indigo' },
      { label: '通報件数', value: dashboardData.stats?.reports ?? '...', sub: 'Reports', change: '-2.4%', icon: AlertCircle, color: 'rose' },
   ];

   const logs = dashboardData.logs.length > 0 ? dashboardData.logs.map((log: any) => ({
      time: formatTime(log.time),
      text: log.text
   })) : [
      { time: '2分前', text: 'システム管理者により新規管理者アカウントが承認されました。' },
      { time: '45分前', text: 'サーバーメンテナンスが正常に完了しました。' },
      { time: '2時間前', text: 'グローバル通知送信：「東京サクラウォーク 2024」' },
      { time: '5時間前', text: 'ユーザー(ID: 4920)がコミュニティガイドライン違反により凍結されました。' },
      { time: '昨日', text: 'データベースの自動バックアップが完了しました。' }
   ];

   return (
      <div className="p-10 max-w-7xl mx-auto">
         <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">システム概要</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">System Administration & Stats</p>
         </header>

         {/* Summary Stats */}
         <div className="grid grid-cols-4 gap-6 mb-10">
            {stats.map((stat, i) => (
               <div key={i} className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-6">
                     <div className={`p-4 rounded-2xl ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                        stat.color === 'green' ? 'bg-green-50 text-green-600' :
                           stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                        <stat.icon className="w-6 h-6" />
                     </div>
                     <div className={`flex items-center gap-1 text-[11px] font-black italic rounded-full px-3 py-1 ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                        {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{stat.change}</span>
                     </div>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 mb-1">{stat.value}</h3>
                  <p className="text-[9px] font-bold text-slate-300 uppercase italic leading-none">{stat.sub}</p>

                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
               </div>
            ))}
         </div>

         <div className="grid grid-cols-3 gap-10">
            <div className="col-span-2">
               {/* Main Chart Area placeholder */}
               <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 h-full min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-10 left-10">
                     <h3 className="text-xl font-extrabold text-slate-900">ユーザー成長率</h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">User Growth Analytics</p>
                  </div>

                  {/* Mock Chart Visualization */}
                  <div className="w-full mt-20 flex items-end gap-2 h-48 px-10">
                     {[40, 60, 45, 80, 55, 90, 75, 100, 85, 120, 95, 140].map((h, i) => (
                        <div key={i} className="flex-1 bg-blue-50 rounded-t-xl relative group">
                           <div
                              className="absolute bottom-0 left-0 w-full bg-[#0F4186] rounded-t-xl transition-all duration-1000 opacity-80 group-hover:opacity-100"
                              style={{ height: `${h}%` }}
                           />
                        </div>
                     ))}
                  </div>
                  <div className="w-full px-10 mt-4 flex justify-between text-[10px] font-bold text-slate-300 uppercase">
                     <span>1月</span>
                     <span>12月</span>
                  </div>
               </section>
            </div>

            {/* Sidebar: System Logs */}
            <div className="col-span-1">
               <section className="bg-[#0F4186] rounded-[40px] p-10 h-full text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
                  <div className="relative z-10 h-full flex flex-col">
                     <div className="flex items-center justify-between mb-12">
                        <h3 className="text-xl font-black italic tracking-tight">システム監査ログ</h3>
                        <button className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"><RotateCcw className="w-5 h-5" /></button>
                     </div>

                     <div className="flex-1 space-y-10">
                        {logs.map((log, i) => (
                           <div key={i} className="flex gap-4 relative group/log">
                              <div className="flex flex-col items-center">
                                 <div className="w-2.5 h-2.5 bg-blue-300 rounded-full group-hover/log:scale-150 transition-transform" />
                                 {i !== logs.length - 1 && <div className="w-0.5 flex-1 bg-blue-300/20 my-2" />}
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-blue-200/50 uppercase tracking-widest mb-2">{log.time}</p>
                                 <p className="text-sm font-medium leading-relaxed">{log.text}</p>
                              </div>
                           </div>
                        ))}
                     </div>

                     <button className="w-full py-5 bg-white/10 border-2 border-white/10 rounded-[28px] mt-12 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] hover:bg-white/20 transition-all">
                        <Download className="w-4 h-4" />
                        <span>監査ログをダウンロード</span>
                     </button>
                  </div>

                  {/* Decorative radial gradient */}
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
               </section>
            </div>
         </div>
      </div>
   );
}

