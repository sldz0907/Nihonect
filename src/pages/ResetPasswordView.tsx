import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, RefreshCw, Send, Languages } from 'lucide-react';

interface ResetPasswordViewProps {
  onBack: () => void;
  isTranslateOn: boolean;
  onToggleTranslate: () => void;
}

export default function ResetPasswordView({ onBack, isTranslateOn, onToggleTranslate }: ResetPasswordViewProps) {
  const [submitted, setSubmitted] = useState(false);

  const t = (ja: string, vi: string) => (isTranslateOn ? vi : ja);

  return (
    <div className="min-h-screen bg-[#FDFEFE] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[100px] h-[100px] bg-blue-100 rounded-full blur-[80px] opacity-20" />
      <div className="absolute bottom-1/4 right-1/4 w-[150px] h-[150px] bg-pink-100 rounded-full blur-[100px] opacity-20" />
      
      <div className="w-full max-w-sm absolute top-8 left-8 flex items-center gap-2">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-[#0F4186]">Nihonect</span>
      </div>

      <div className="absolute top-8 right-8 select-none">
        {/* Translation Switch */}
        <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
           <Languages className="w-3.5 h-3.5 text-blue-600" />
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('自動翻訳', 'Tự động dịch')}</span>
           <button 
              type="button"
              onClick={onToggleTranslate}
              className={`w-9 h-4.5 rounded-full relative transition-all ${isTranslateOn ? 'bg-blue-600' : 'bg-slate-300'}`}
           >
              <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${isTranslateOn ? 'right-0.5' : 'left-0.5'}`} />
           </button>
           <p className="text-[8px] font-black text-blue-600 border-l border-slate-200 pl-2">JP ↔ VN</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[32px] p-10 shadow-[0_32px_64px_-16px_rgba(15,65,134,0.1)] border border-slate-100 relative z-10"
      >
        {!submitted ? (
          <>
            <div className="w-14 h-14 bg-[#0F4186] rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30">
              <RefreshCw className="text-white w-7 h-7" />
            </div>

            <h1 className="text-3xl font-bold text-[#0F4186] mb-4">{t('パスワードの再設定', 'Đặt lại mật khẩu')}</h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-10">
              {t('ご登録済みのメールアドレスを入力してください。', 'Vui lòng nhập địa chỉ email đã đăng ký.')}<br />
              {t('パスワード再設定用のリンクをお送りします。', 'Chúng tôi sẽ gửi liên kết đặt lại mật khẩu cho bạn.')}
            </p>

            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t('メールアドレス', 'Địa chỉ email')}</label>
                <div className="relative group">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#0F4186] transition-colors" />
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-[#0F4186] outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={() => setSubmitted(true)}
                className="w-full py-5 bg-[#0F4186] text-white rounded-[20px] font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0D3875] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 group"
              >
                <span>{t('再設定リンクを送信', 'Gửi liên kết đặt lại')}</span>
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>

              <button 
                onClick={onBack}
                className="w-full py-4 border-2 border-slate-100 text-slate-500 rounded-[20px] font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('ログイン画面に戻る', 'Quay lại trang đăng nhập')}</span>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Send className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('送信完了', 'Gửi thành công')}</h2>
            <p className="text-slate-500 mb-8">
              {t('メールを送信しました。記載されたリンクからパスワードを再設定してください。', 'Đã gửi email thành công. Vui lòng kiểm tra hộp thư để đặt lại mật khẩu.')}
            </p>
            <button 
              onClick={onBack}
              className="w-full py-4 bg-[#0F4186] text-white rounded-[20px] font-bold"
            >
              {t('ログイン画面へ', 'Quay lại trang đăng nhập')}
            </button>
          </div>
        )}
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 opacity-20 grayscale pointer-events-none">
        <div className="uppercase tracking-[0.2em] text-[10px] font-bold">Connect</div>
        <div className="uppercase tracking-[0.2em] text-[10px] font-bold">Culture</div>
        <div className="uppercase tracking-[0.2em] text-[10px] font-bold">Community</div>
      </div>
      
      <div className="absolute bottom-4 w-full text-center">
        <p className="text-[10px] text-slate-300 uppercase tracking-widest font-medium">{t('© 2024 NIHONECT — THE BRIDGE OF CULTURAL EXCHANGE', '© 2024 NIHONECT — CẦU NỐI GIAO LƯU VĂN HÓA')}</p>
      </div>
    </div>
  );
}
