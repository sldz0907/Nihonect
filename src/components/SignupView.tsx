import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, CheckCircle2, ChevronRight, Languages } from 'lucide-react';

interface SignupViewProps {
  onBack: () => void;
  onSignup: (input: { fullName: string; email: string; password: string }) => Promise<void>;
}

export default function SignupView({ onBack, onSignup }: SignupViewProps) {
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('すべての項目を入力してください。');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('パスワードが一致しません。');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('パスワードは6文字以上で入力してください。');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onSignup({ fullName: fullName.trim(), email: email.trim(), password });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '新規登録に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="p-8 flex justify-end">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-sm font-medium hover:bg-white transition-all text-slate-600">
          <Languages className="w-4 h-4" />
          <span>VN / JP</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 max-w-md hidden lg:block">
            <div className="mb-8">
              <div className="w-12 h-12 bg-[#0F4186] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <CheckCircle2 className="text-white w-6 h-6" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                日本とベトナムを<br />
                <span className="text-[#0F4186]">繋ぐ新しい一歩</span>
              </h1>
              <p className="text-slate-600 leading-relaxed mb-8">
                日本とベトナムの架け橋となるコミュニティへようこそ。文化交流、ビジネス、そして新しい出会いがここから始まります。
              </p>
              
              <div className="flex items-center gap-4 bg-white/60 backdrop-blur p-4 rounded-xl border border-slate-200/60">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <img key={i} src={`https://i.pravatar.cc/50?img=${i + 20}`} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
                <p className="text-sm text-slate-500 font-medium">5,000人以上のメンバーが参加中</p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-4/3 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop" 
                className="w-full h-full object-cover"
                alt="Zen Garden"
              />
            </div>
          </div>

          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 lg:p-10 border border-slate-100">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">アカウント作成</h2>
              <p className="text-slate-500 text-sm">必要な情報を入力して、コミュニティに参加しましょう。</p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">氏名</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0F4186]" />
                    <input 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#0F4186] outline-none transition-all text-sm"
                      placeholder="山田 太郎"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">メールアドレス</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0F4186]" />
                    <input 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#0F4186] outline-none transition-all text-sm"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">パスワード</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0F4186]" />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#0F4186] outline-none transition-all text-sm"
                    placeholder="********"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">パスワード（確認用）</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0F4186]" />
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#0F4186] outline-none transition-all text-sm"
                    placeholder="********"
                  />
                </div>
              </div>

              <div className="py-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${agreed ? 'bg-[#0F4186] border-[#0F4186]' : 'border-slate-200 group-hover:border-slate-300'}`}>
                    <input type="checkbox" className="hidden" checked={agreed} onChange={() => setAgreed(!agreed)} />
                    {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-[13px] text-slate-500">
                    <button className="text-[#0F4186] font-bold hover:underline">利用規約</button>と<button className="text-[#0F4186] font-bold hover:underline">プライバシーポリシー</button>に同意する
                  </span>
                </label>
              </div>

              {errorMessage && (
                <p className="text-sm font-medium text-rose-600">{errorMessage}</p>
              )}

              <button 
                onClick={handleSignup}
                disabled={!agreed || isSubmitting}
                className="w-full py-4 bg-[#0F4186] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0D3875] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
              >
                <span>{isSubmitting ? '処理中...' : '新規登録'}</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-center pt-4">
                <span className="text-slate-500 text-sm">既にアカウントをお持ちですか？ </span>
                <button onClick={onBack} className="text-[#0F4186] font-bold hover:underline">ログイン</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-8 text-center border-t border-slate-200/50">
        <div className="flex justify-center gap-8 mb-4">
          <button className="text-xs text-slate-400 hover:text-slate-600">利用規約</button>
          <button className="text-xs text-slate-400 hover:text-slate-600">プライバシーポリシー</button>
          <button className="text-xs text-slate-400 hover:text-slate-600">お問い合わせ</button>
        </div>
        <p className="text-xs text-slate-300">© 2024 Nihonect. ハノイの日本・ベトナムコミュニティ。</p>
      </div>
    </div>
  );
}
