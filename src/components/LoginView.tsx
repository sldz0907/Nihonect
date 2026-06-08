import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Languages } from 'lucide-react';
import { Role } from '../types';

interface LoginViewProps {
  onLogin: (input: { email: string; password: string; role: Role }) => Promise<void>;
  onSignup: () => void;
  onForgotPassword: () => void;
  successMessage?: string | null;
  isTranslateOn: boolean;
  onToggleTranslate: () => void;
}

export default function LoginView({ 
  onLogin, 
  onSignup, 
  onForgotPassword, 
  successMessage,
  isTranslateOn,
  onToggleTranslate
}: LoginViewProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = (ja: string, vi: string) => (isTranslateOn ? vi : ja);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setErrorMessage(t('メールアドレスとパスワードを入力してください。', 'Vui lòng nhập email và mật khẩu.'));
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onLogin({ email: email.trim(), password, role: selectedRole });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('ログインに失敗しました。', 'Đăng nhập thất bại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left side: Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#0F4186] text-white p-16 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Nihonect</h1>
          <p className="text-blue-100/80 text-sm">{t('ハノイと東京をつなぐ架け橋', 'Cầu nối giữa Hà Nội và Tokyo')}</p>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold leading-tight mb-8"
          >
            {t('国境を越えた、', 'Kết nối có giá trị ')}<br />
            {t('価値のある', 'vượt qua ')}<br />
            {t('つながりを。', 'biên giới.')}
          </motion.h2>
          <p className="text-blue-100/70 text-lg mb-12">
            {t('ベトナムと日本の架け橋となる、', 'Chào mừng bạn đến với cộng đồng mới, ')}<br />
            {t('新しいコミュニティへようこそ。', 'cầu nối giữa Việt Nam và Nhật Bản.')}
          </p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <img 
                  key={i}
                  src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                  className="w-12 h-12 rounded-full border-2 border-slate-900 object-cover"
                  alt="User"
                />
              ))}
            </div>
            <div>
              <p className="font-bold text-white">{t('12,000人以上のメンバー', 'Hơn 12.000 thành viên')}</p>
              <p className="text-blue-100/60 text-sm">{t('今月の新規参加者', 'Thành viên mới trong tháng')}</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-4 text-xs text-blue-100/40">
          <button className="hover:text-white transition-colors">{t('プライバシーポリシー', 'Chính sách bảo mật')}</button>
          <button className="hover:text-white transition-colors">{t('利用規約', 'Điều khoản sử dụng')}</button>
        </div>

        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white text-white opacity-[0.03] rounded-full -mr-96 -mt-96" />
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-linear-to-br from-white to-blue-50/30">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-8">
            <h1 className="lg:hidden text-2xl font-bold text-[#0F4186]">Nihonect</h1>
            {/* Translation Switch */}
            <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm select-none">
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

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{t('おかえりなさい', 'Chào mừng quay lại')}</h2>
            <p className="text-slate-500">{t('Nihonectへログインして始めましょう', 'Đăng nhập vào Nihonect để bắt đầu')}</p>
          </div>

          {successMessage && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm font-medium">
              {successMessage}
            </div>
          )}

          {/* Social Logins */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {['Google', 'LINE', 'Facebook'].map((social) => (
              <button 
                key={social}
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-[#0F4186] hover:bg-white transition-all group"
              >
                <div className="w-6 h-6 mb-2 grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100 flex items-center justify-center">
                  {/* Mock icons */}
                  <div className={`w-full h-full rounded-sm ${social === 'Google' ? 'bg-red-500' : social === 'LINE' ? 'bg-green-500' : 'bg-blue-600'}`} />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 group-hover:text-slate-600">{social}</span>
              </button>
            ))}
          </div>

          <div className="relative mb-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative px-4 text-xs font-medium text-slate-400 bg-transparent uppercase tracking-wider italic">{t('またはメールアドレスでログイン', 'Hoặc đăng nhập bằng email')}</span>
          </div>

          {/* Forms */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('メールアドレス', 'Địa chỉ email')}</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0F4186] transition-colors" />
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#0F4186] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700">{t('パスワード', 'Mật khẩu')}</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0F4186] transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#0F4186] outline-none transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F4186]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('役割を選択', 'Chọn vai trò')}</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                {(['USER', 'ADMIN'] as Role[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      selectedRole === role 
                        ? 'bg-white text-[#0F4186] shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <div className="uppercase">{role === 'USER' ? t('一般ユーザー', 'Người dùng thông thường') : t('管理者', 'Quản trị viên')}</div>
                    <div className="text-[9px] opacity-60 font-normal">{role}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#0F4186] focus:ring-0" />
                <span className="text-sm text-slate-500 group-hover:text-slate-700">{t('ログイン状態を保持する', 'Duy trì đăng nhập')}</span>
              </label>
              <button 
                onClick={onForgotPassword}
                className="text-sm font-bold text-[#0F4186] hover:underline"
              >
                {t('パスワードを忘れた場合', 'Quên mật khẩu?')}
              </button>
            </div>

            {errorMessage && (
              <p className="text-sm font-medium text-rose-600">{errorMessage}</p>
            )}

            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-[#0F4186] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0D3875] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? t('処理中...', 'Đang xử lý...') : t('ログイン', 'Đăng nhập')}
            </button>

            <div className="text-center">
              <span className="text-slate-500 text-sm">{t('アカウントをお持ちではありませんか？ ', 'Bạn chưa có tài khoản? ')}</span>
              <button onClick={onSignup} className="text-[#0F4186] font-bold hover:underline">{t('新規登録', 'Đăng ký mới')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
