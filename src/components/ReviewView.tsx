import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Send, X, ShieldCheck, MessageSquareText, Info, Loader2 } from 'lucide-react';

interface ReviewViewProps {
  buddyId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function ReviewView({ buddyId, onBack, onSuccess }: ReviewViewProps) {
  const [rating, setRating] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('評価（星）を選択してください。 / Vui lòng chọn số sao đánh giá.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/reviews/${buddyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, categories: selectedCategories, text })
      });

      if (!res.ok) {
        throw new Error('レビューの送信に失敗しました。 / Lỗi khi gửi đánh giá.');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="h-40 shrink-0 w-full bg-gradient-to-br from-[#0F4186] to-[#0D3875] relative flex items-center justify-center">
            <button onClick={onBack} className="absolute top-8 right-8 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="absolute top-10 left-12">
               <h2 className="text-white text-2xl font-black italic opacity-20 tracking-widest uppercase select-none">Feedback</h2>
            </div>
        </div>

        <div className="p-8 lg:p-12 -mt-10 bg-white rounded-t-[40px] relative z-10 flex-1 overflow-y-auto custom-scrollbar">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">インタラクションを評価する</h3>
            <p className="text-slate-500 text-sm">体験を評価してください<br /><span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Đánh giá trải nghiệm của bạn</span></p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <button 
                key={i} 
                className="group relative"
                onMouseEnter={() => setRating(i)}
                onClick={() => setRating(i)}
              >
                <div className={`absolute inset-0 blur-2xl transition-all duration-500 ${rating >= i ? 'bg-amber-400 opacity-20' : 'opacity-0'}`} />
                <Star 
                  className={`w-12 h-12 transition-all duration-300 ${
                    rating >= i ? 'text-amber-500 fill-amber-500 scale-110 drop-shadow-lg' : 'text-slate-100 fill-slate-100 hover:text-amber-200'
                  }`} 
                />
              </button>
            ))}
          </div>

          <div className="text-center mb-10 h-8">
             <p className={`text-xl font-bold transition-all duration-500 ${rating > 0 ? 'text-rose-500 opacity-100' : 'text-slate-300 opacity-0'}`}>
                {rating === 5 ? '素晴らしい！' : rating === 4 ? 'とても良い' : rating === 3 ? '普通' : rating === 2 ? 'あまり良くない' : rating === 1 ? '非常に悪い' : ''}
                <br /><span className="text-xs font-medium uppercase tracking-tighter block">
                  {rating === 5 ? 'Rất tuyệt!' : rating === 4 ? 'Rất tốt' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Không tốt lắm' : rating === 1 ? 'Rất tệ' : ''}
                </span>
             </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { id: 'rel', label: '信頼性', sub: 'TIN CẬY', icon: ShieldCheck },
              { id: 'comm', label: 'コミュニケーション', sub: 'GIAO TIẾP', icon: MessageSquareText },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  selectedCategories.includes(cat.id) 
                    ? 'border-[#0F4186] bg-blue-50/50 shadow-inner' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex flex-col items-start gap-1">
                   <cat.icon className={`w-5 h-5 mb-2 ${selectedCategories.includes(cat.id) ? 'text-[#0F4186]' : 'text-slate-400'}`} />
                   <p className="text-xs font-black text-slate-800 uppercase tracking-tighter leading-none">{cat.label}</p>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{cat.sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedCategories.includes(cat.id) ? 'bg-[#0F4186] border-[#0F4186]' : 'border-slate-200'
                }`}>
                  {selectedCategories.includes(cat.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>

          <div className="mb-10">
            <div className="flex justify-between items-center mb-3 px-1">
               <label className="text-xs font-bold text-slate-800 uppercase tracking-widest">レビューを記入</label>
               <span className="text-[10px] font-bold text-slate-400 uppercase">{text.length}/500文字</span>
            </div>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              className="w-full h-32 p-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm placeholder:text-slate-300 resize-none"
              placeholder="セッションはどうでしたか？何を学びましたか？（日本語またはベトナム語で入力してください）"
            />
          </div>

          <div className="space-y-4">
             <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-5 bg-[#0F4186] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-[#0D3875] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:hover:translate-y-0"
             >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>評価を送信する</span>
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
             </button>
             <button onClick={onBack} disabled={isSubmitting} className="w-full py-3 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50">
                後で / あとで評価する
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
