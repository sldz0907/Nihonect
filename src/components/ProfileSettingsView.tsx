import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { User, View, DEFAULT_AVATAR } from '../types';
import { Camera, ChevronDown, Check } from 'lucide-react';
import Sidebar from './shared/Sidebar';
import NotificationBell from './shared/NotificationBell';

interface ProfileSettingsViewProps {
  user: User;
  onNavigate: (view: View) => void;
  onLogout?: () => void;
  onUpdateUser?: (user: User) => void;
}

export default function ProfileSettingsView({ user, onNavigate, onLogout, onUpdateUser }: ProfileSettingsViewProps) {
  const interestOptions = ['文化', 'グルメ', 'IT交流', '言語交換', '格闘技', '伝統音楽', 'スタートアップ', 'ハイキング'];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fullName, setFullName] = useState(user.name ?? '');
  const [bio, setBio] = useState(user.bio ?? '');
  const [livingArea, setLivingArea] = useState(user.livingArea ?? '');
  const [japaneseLevel, setJapaneseLevel] = useState(user.japaneseLevel ?? '');
  const [vietnameseLevel, setVietnameseLevel] = useState(user.vietnameseLevel ?? '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user.interests ?? []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(user.profilePicture ?? DEFAULT_AVATAR);
  const [removeProfilePicture, setRemoveProfilePicture] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFullName(user.name ?? '');
    setBio(user.bio ?? '');
    setLivingArea(user.livingArea ?? '');
    setJapaneseLevel(user.japaneseLevel ?? '');
    setVietnameseLevel(user.vietnameseLevel ?? '');
    setSelectedInterests(user.interests ?? []);
    setPreviewImage(user.profilePicture ?? DEFAULT_AVATAR);
    setImageFile(null);
    setRemoveProfilePicture(false);
    setMessage(null);
    setErrorMessage(null);
  }, [user]);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    setImageFile(file);
    setRemoveProfilePicture(false);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    setFullName(user.name ?? '');
    setBio(user.bio ?? '');
    setLivingArea(user.livingArea ?? '');
    setJapaneseLevel(user.japaneseLevel ?? '');
    setVietnameseLevel(user.vietnameseLevel ?? '');
    setSelectedInterests(user.interests ?? []);
    setPreviewImage(user.profilePicture ?? DEFAULT_AVATAR);
    setImageFile(null);
    setRemoveProfilePicture(false);
    setMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setErrorMessage(null);
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('bio', bio);
      formData.append('livingArea', livingArea);
      formData.append('japaneseLevel', japaneseLevel);
      formData.append('vietnameseLevel', vietnameseLevel);
      formData.append('interests', JSON.stringify(selectedInterests));
      if (imageFile) {
        formData.append('profilePicture', imageFile);
      } else if (removeProfilePicture) {
        formData.append('removeProfilePicture', 'true');
      }

      // Debug: log FormData
      console.log('FormData entries:');
      formData.forEach((value, key) => {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      });

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('認証トークンが見つかりません。もう一度ログインしてください。');
      }

      console.log('Sending PUT request to /api/users/profile with token:', token.substring(0, 20) + '...');

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status, response.statusText);

      // Check if response is empty or not JSON
      const responseText = await response.text();
      console.log('Response text:', responseText.substring(0, 100));
      
      if (!responseText) {
        throw new Error('サーバーからの応答がありません。しばらく待ってからもう一度お試しください。');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', responseText);
        throw new Error('サーバーからの応答が無効です。管理者に報告してください。');
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'プロフィールの保存に失敗しました。');
      }

      setMessage('プロフィールが正常に保存されました。');
      setErrorMessage(null);
      
      if (data.user) {
        const role = data.user.role === 'admin' || data.user.role === 'ADMIN' ? 'ADMIN' : 'USER';
        const updatedUser: User = {
          ...user,
          name: data.user.fullName || user.name,
          profilePicture: data.user.profilePicture,
          avatar: data.user.profilePicture || DEFAULT_AVATAR,
          bio: data.user.bio,
          livingArea: data.user.livingArea,
          japaneseLevel: data.user.japaneseLevel,
          vietnameseLevel: data.user.vietnameseLevel,
          interests: data.user.interests,
          location: data.user.location,
          nationality: data.user.nationality,
          job: data.user.job,
          age: data.user.age,
          role: role
        };
        
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
        if (onUpdateUser) {
          onUpdateUser(updatedUser);
        }
        
        if (updatedUser.profilePicture) {
          setPreviewImage(updatedUser.profilePicture);
        }
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      setErrorMessage(error.message || 'プロフィールの保存中にエラーが発生しました。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setRemoveProfilePicture(true);
    setPreviewImage(DEFAULT_AVATAR);
  };

  return (
    <div className="flex bg-[#F8FAFC] h-screen overflow-hidden">
      <Sidebar currentView={View.PROFILE_SETTINGS} onNavigate={onNavigate} onLogout={onLogout} role={user.role} />
      
      <div className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-[#F8FAFC]/80 backdrop-blur-md px-8 py-4 flex items-center justify-end gap-4 border-b border-slate-100">
           <NotificationBell />
           <button className="flex items-center gap-3 pl-3 pr-1 py-1 bg-white border border-slate-200 rounded-full hover:border-[#0F4186] transition-all group">
              <span className="text-xs font-bold text-slate-700">{user.name}</span>
              <img src={user.profilePicture || DEFAULT_AVATAR} alt="Me" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
           </button>
        </header>

        <main className="max-w-3xl mx-auto p-12">
           <div className="mb-12">
              <h1 className="text-4xl font-extrabold text-[#0F4186] mb-2 tracking-tight">こんにちは、{user.name}さん！</h1>
              <p className="text-slate-500 font-medium">日本とベトナムのコミュニティとの繋がりを深めるために、プロフィールを更新してください。</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Photo */}
              <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                 <div className="flex items-center gap-10">
                    <div className="relative">
                       <img
                         src={previewImage || DEFAULT_AVATAR}
                         alt="プロフィールプレビュー"
                         className="w-32 h-32 rounded-[40px] object-cover border-4 border-slate-50 shadow-xl shadow-blue-500/5 bg-slate-100"
                       />
                    </div>
                    <div className="flex-1">
                       <h3 className="text-lg font-extrabold text-slate-900 mb-2">プロフィール写真</h3>
                       <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
                          顔がはっきりとわかる写真をアップロードしてください。PNG, JPG形式。最大5MBまで。
                       </p>
                       <div className="flex gap-3">
                          <button type="button" onClick={handleUploadClick} className="px-6 py-2.5 bg-[#0F4186] text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all">画像をアップロード</button>
                          <button type="button" onClick={handleRemoveImage} className="px-6 py-2.5 bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">削除</button>
                       </div>
                       <div className="text-xs text-slate-400 mt-3">
                         {imageFile ? `選択中: ${imageFile.name}` : previewImage ? '現在のプロフィール画像' : '画像が選択されていません'}
                       </div>
                       <input
                         ref={fileInputRef}
                         type="file"
                         accept="image/png,image/jpeg,image/jpg"
                         className="hidden"
                         onChange={handleFileChange}
                       />
                    </div>
                 </div>
              </section>

              {/* Full Name */}
              <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                 <div className="mb-6">
                    <h3 className="text-lg font-extrabold text-slate-900 mb-1">氏名</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Full Name / Họ tên</p>
                 </div>
                 <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-medium placeholder:text-slate-300"
                    placeholder="氏名を入力してください"
                 />
              </section>

              {/* Bio */}
              <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                       <h3 className="text-lg font-extrabold text-slate-900 mb-1">自己紹介</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bio / Giới thiệu bản thân</p>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase">{bio.length}/300</span>
                 </div>
                 <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={300}
                    className="w-full h-40 p-6 bg-slate-50 border-2 border-transparent rounded-4xl outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-medium placeholder:text-slate-300 resize-none"
                    placeholder="日本やベトナムとの関わりについて教えてください..."
                 />
              </section>

              {/* Residence Area */}
              <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                 <div className="mb-6">
                    <h3 className="text-lg font-extrabold text-slate-900 mb-1">ハノイの居住エリア</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Living Area in Hanoi / Khu vực sinh sống tại Hà Nội</p>
                 </div>
                 <div className="relative group">
                    <select
                      value={livingArea}
                      onChange={(e) => setLivingArea(e.target.value)}
                      className="w-full pl-6 pr-12 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                    >
                       <option value="">選択してください</option>
                       <option value="Ba Dinh">バーディン区 (Ba Đình)</option>
                       <option value="Hoan Kiem">ホアンキエム区 (Hoàn Kiếm)</option>
                       <option value="Hai Ba Trung">ハイバーチュン区 (Hai Bà Trưng)</option>
                       <option value="Dong Da">ドンダー区 (Đống Đa)</option>
                       <option value="Tay Ho">タイホー区 (Tây Hồ)</option>
                       <option value="Cau Giay">カウザイ区 (Cầu Giấy)</option>
                       <option value="Thanh Xuan">タインスアン区 (Thanh Xuân)</option>
                       <option value="Ha Dong">ハドン区 (Hà Đông)</option>
                       <option value="Bac Tu Liem">バクトゥーリエム区 (Bắc Từ Liêm)</option>
                       <option value="Nam Tu Liem">ナムトゥーリエム区 (Nam Từ Liêm)</option>
                       <option value="My Duc">ミーデュック県 (Mỹ Đức)</option>
                       <option value="Dan Phuong">ダンフォン県 (Dân Phương)</option>
                       <option value="Thuong Tin">トゥオンティン県 (Thượng Tín)</option>
                       <option value="Hoai Duc">ホアイドゥック県 (Hoài Đức)</option>
                       <option value="Quoc Oai">クォックオアイ県 (Quốc Oai)</option>
                       <option value="Phu Xuyen">フーズエン県 (Phú Xuyên)</option>
                       <option value="Soc Son">ソックソン県 (Sóc Sơn)</option>
                       <option value="Me Linh">メーリン県 (Mê Linh)</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:text-[#0F4186] transition-colors" />
                 </div>
              </section>

              {/* Language Level */}
              <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                 <div className="mb-10">
                    <h3 className="text-lg font-extrabold text-slate-900 mb-1">語学能力</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Language Proficiency / Năng lực ngôn ngữ</p>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 pl-1">日本語レベル (JLPT)</label>
                        <div className="relative group">
                           <select
                             value={japaneseLevel}
                             onChange={(e) => setJapaneseLevel(e.target.value)}
                             className="w-full pl-6 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                           >
                              <option value="">選択してください</option>
                              <option value="N1">N1 - ビジネスレベル</option>
                              <option value="N2">N2 - 日常会話レベル</option>
                              <option value="N3">N3 - 基礎会話</option>
                           </select>
                           <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 pl-1">ベトナム語レベル (VSTEP)</label>
                        <div className="relative group">
                           <select
                             value={vietnameseLevel}
                             onChange={(e) => setVietnameseLevel(e.target.value)}
                             className="w-full pl-6 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                           >
                              <option value="">選択してください</option>
                              <option value="C1/C2">C1/C2 - 上級</option>
                              <option value="B1/B2">B1/B2 - 中上級</option>
                           </select>
                           <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                 </div>
              </section>

              {/* Interests */}
              <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                 <div className="mb-8">
                    <h3 className="text-lg font-extrabold text-slate-900 mb-1">興味・関心</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Interests / Sở thích</p>
                 </div>
                 <div className="flex flex-wrap gap-3">
                    {interestOptions.map((interest) => {
                       const isSelected = selectedInterests.includes(interest);
                       return (
                          <button
                            type="button"
                            key={interest}
                            onClick={() => handleInterestToggle(interest)}
                            className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${
                               isSelected 
                                 ? 'bg-[#0F4186] text-white border-[#0F4186] shadow-lg shadow-blue-500/10' 
                                 : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                            }`}
                          >
                             {isSelected && <Check className="w-3.5 h-3.5" />}
                             <span>{interest}</span>
                          </button>
                       );
                    })}
                 </div>
              </section>

              {message && (
                <div className="rounded-3xl bg-emerald-100 text-emerald-800 p-4">
                  {message}
                </div>
              )}
              {errorMessage && (
                <div className="rounded-3xl bg-rose-100 text-rose-800 p-4">
                  {errorMessage}
                </div>
              )}

              <div className="flex justify-end gap-4 pb-12">
                 <button
                   type="button"
                   onClick={handleCancel}
                   className="px-10 py-5 bg-white text-slate-500 rounded-3xl font-black uppercase tracking-widest border-2 border-transparent hover:bg-slate-100 transition-all text-xs"
                 >
                   キャンセル
                 </button>
                 <button
                   type="submit"
                   disabled={isSaving}
                   className="px-12 py-5 bg-[#0F4186] text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:-translate-y-1 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isSaving ? '保存中...' : '変更を保存'}
                 </button>
              </div>
           </form>
        </main>

        <footer className="p-8 border-t border-slate-100 flex items-center justify-between opacity-50">
           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Nihonect <span className="font-light">© 2024 Nihonect. ハノイと東京を繋ぐ。</span>
           </div>
           <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest text-slate-400">
              <button className="hover:text-[#0F4186]">プライバシー</button>
              <button className="hover:text-[#0F4186]">利用規約</button>
              <button className="hover:text-[#0F4186]">コミュニティガイドライン</button>
           </div>
        </footer>
      </div>
    </div>
  );
}
