import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Languages } from 'lucide-react';
import { Role } from '../types';

interface LoginViewProps {
  onLogin: (input: { email: string; password: string; role: Role }) => Promise<void>;
  onSignup: () => void;
  onForgotPassword: () => void;
  successMessage?: string | null;
}

export default function LoginView({ onLogin, onSignup, onForgotPassword, successMessage }: LoginViewProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('メールアドレスとパスワードを入力してください。');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onLogin({ email: email.trim(), password, role: selectedRole });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'ログインに失敗しました。');
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
          <p className="text-blue-100/80 text-sm">ハノイと東京をつなぐ架け橋</p>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold leading-tight mb-8"
          >
            国境を越えた、<br />
            価値のある<br />
            つながりを。
          </motion.h2>
          <p className="text-blue-100/70 text-lg mb-12">
            ベトナムと日本の架け橋となる、<br />
            新しいコミュニティへようこそ。
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
              <p className="font-bold text-white">12,000人以上のメンバー</p>
              <p className="text-blue-100/60 text-sm">今月の新規参加者</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-4 text-xs text-blue-100/40">
          <button className="hover:text-white transition-colors">プライバシーポリシー</button>
          <button className="hover:text-white transition-colors">利用規約</button>
        </div>

        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white text-white opacity-[0.03] rounded-full -mr-96 -mt-96" />
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-linear-to-br from-white to-blue-50/30">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-8">
            <h1 className="lg:hidden text-2xl font-bold text-[#0F4186]">Nihonect</h1>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-sm font-medium hover:bg-white transition-all text-slate-600">
              <Languages className="w-4 h-4" />
              <span>VN / JP</span>
            </button>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">おかえりなさい</h2>
            <p className="text-slate-500">Nihonectへログインして始めましょう</p>
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
            <span className="relative px-4 text-xs font-medium text-slate-400 bg-transparent uppercase tracking-wider italic">またはメールアドレスでログイン</span>
          </div>

          {/* Forms */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">メールアドレス</label>
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
                <label className="block text-sm font-bold text-slate-700">パスワード</label>
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
              <label className="block text-sm font-bold text-slate-700 mb-2">役割を選択</label>
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
                    <div className="uppercase">{role === 'USER' ? '一般ユーザー' : '管理者'}</div>
                    <div className="text-[9px] opacity-60 font-normal">{role}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#0F4186] focus:ring-0" />
                <span className="text-sm text-slate-500 group-hover:text-slate-700">ログイン状態を保持する</span>
              </label>
              <button 
                onClick={onForgotPassword}
                className="text-sm font-bold text-[#0F4186] hover:underline"
              >
                パスワードを忘れた場合
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
              {isSubmitting ? '処理中...' : 'ログイン'}
            </button>

            <div className="text-center">
              <span className="text-slate-500 text-sm">アカウントをお持ちではありませんか？ </span>
              <button onClick={onSignup} className="text-[#0F4186] font-bold hover:underline">新規登録</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
