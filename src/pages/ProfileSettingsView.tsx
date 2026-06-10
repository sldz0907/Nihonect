import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { User, View, DEFAULT_AVATAR } from '../types/index';
import { Camera, ChevronDown, Check, Languages } from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import NotificationBell from '../components/shared/NotificationBell';

interface ProfileSettingsViewProps {
  user: User;
  onNavigate: (view: View) => void;
  onLogout?: () => void;
  onUpdateUser?: (user: User) => void;
  isTranslateOn: boolean;
  onToggleTranslate: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function ProfileSettingsView({ user, onNavigate, onLogout, onUpdateUser, isTranslateOn, onToggleTranslate }: ProfileSettingsViewProps) {
  const interestOptions = [
    { ja: '文化', vi: 'Văn hóa' },
    { ja: 'グルメ', vi: 'Ẩm thực' },
    { ja: 'IT交流', vi: 'Giao lưu IT' },
    { ja: '言語交換', vi: 'Trao đổi ngôn ngữ' },
    { ja: '格闘技', vi: 'Võ thuật' },
    { ja: '伝統音楽', vi: 'Âm nhạc truyền thống' },
    { ja: 'スタートアップ', vi: 'Khởi nghiệp' },
    { ja: 'ハイキング', vi: 'Leo núi' }
  ];
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

  const t = (ja: string, vi: string) => (isTranslateOn ? vi : ja);

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

  const handleInterestToggle = (interestJa: string) => {
    setSelectedInterests((current) =>
      current.includes(interestJa)
        ? current.filter((item) => item !== interestJa)
        : [...current, interestJa],
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    setImageFile(file);
    setRemoveProfilePicture(false);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setRemoveProfilePicture(true);
    setPreviewImage(DEFAULT_AVATAR);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error(t('認証トークンが見つかりません。もう一度ログインしてください。', 'Không tìm thấy mã xác thực. Vui lòng đăng nhập lại.'));
      }

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseText = await response.text();
      
      if (!responseText) {
        throw new Error(t('サーバーからの応答がありません。しばらく待ってからもう一度お試しください。', 'Không có phản hồi từ máy chủ. Vui lòng thử lại sau.'));
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(t('サーバーからの応答が無効です。管理者に報告してください。', 'Phản hồi từ máy chủ không hợp lệ. Vui lòng báo cáo với quản trị viên.'));
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || t('プロフィールの保存に失敗しました。', 'Lưu hồ sơ thất bại.'));
      }

      setMessage(t('プロフィールが正常に保存されました。', 'Cập nhật hồ sơ thành công.'));
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
      setErrorMessage(error.message || t('プロフィールの保存中にエラーが発生しました。', 'Đã xảy ra lỗi trong quá trình lưu hồ sơ.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] h-screen overflow-hidden">
      <Sidebar currentView={View.PROFILE_SETTINGS} onNavigate={onNavigate} onLogout={onLogout} role={user.role} />
      
      <div className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-[#F8FAFC]/80 backdrop-blur-md px-8 py-4 flex items-center justify-end gap-4 border-b border-slate-100">
           {/* Translation Switch */}
           <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
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
           <NotificationBell />
           <button className="flex items-center gap-3 pl-3 pr-1 py-1 bg-white border border-slate-200 rounded-full hover:border-[#0F4186] transition-all group">
              <span className="text-xs font-bold text-slate-700">{user.name}</span>
              <img src={user.profilePicture || DEFAULT_AVATAR} alt="Me" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
           </button>
        </header>

        <main className="max-w-3xl mx-auto p-12">
           <div className="mb-12">
              <h1 className="text-4xl font-extrabold text-[#0F4186] mb-2 tracking-tight">{t(`こんにちは、${user.name}さん！`, `Xin chào, ${user.name}!`)}</h1>
              <p className="text-slate-500 font-medium">{t('日本とベトナムのコミュニティとの繋がりを深めるために、プロフィールを更新してください。', 'Hãy cập nhật hồ sơ của bạn để thắt chặt kết nối với cộng đồng Nhật - Việt.')}</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Photo */}
              <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                 <div className="flex items-center gap-10">
                    <div className="relative">
                       <img
                         src={previewImage || DEFAULT_AVATAR}
                         alt={t('プロフィールプレビュー', 'Xem trước ảnh đại diện')}
                         className="w-32 h-32 rounded-[40px] object-cover border-4 border-slate-50 shadow-xl shadow-blue-500/5 bg-slate-100"
                       />
                    </div>
                    <div className="flex-1">
                       <h3 className="text-lg font-extrabold text-slate-900 mb-2">{t('プロフィール写真', 'Ảnh hồ sơ')}</h3>
                       <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
                          {t('顔がはっきりとわかる写真をアップロードしてください。PNG, JPG形式。最大5MBまで。', 'Vui lòng tải lên ảnh chụp rõ mặt. Định dạng PNG, JPG. Tối đa 5MB.')}
                       </p>
                       <div className="flex gap-3">
                          <button type="button" onClick={handleUploadClick} className="px-6 py-2.5 bg-[#0F4186] text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all">{t('画像をアップロード', 'Tải ảnh lên')}</button>
                          <button type="button" onClick={handleRemoveImage} className="px-6 py-2.5 bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">{t('削除', 'Xóa')}</button>
                       </div>
                       <div className="text-xs text-slate-400 mt-3">
                          {imageFile ? t(`選択中: ${imageFile.name}`, `Đang chọn: ${imageFile.name}`) : previewImage ? t('現在のプロフィール画像', 'Ảnh hồ sơ hiện tại') : t('画像が選択されていません', 'Chưa chọn ảnh nào')}
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
                    <h3 className="text-lg font-extrabold text-slate-900 mb-1">{t('氏名', 'Họ tên')}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Full Name / Họ tên</p>
                 </div>
                 <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-medium placeholder:text-slate-300"
                    placeholder={t('氏名を入力してください', 'Vui lòng nhập họ tên')}
                 />
              </section>

              {/* Bio */}
              <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                       <h3 className="text-lg font-extrabold text-slate-900 mb-1">{t('自己紹介', 'Giới thiệu bản thân')}</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bio / Giới thiệu bản thân</p>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase">{bio.length}/300</span>
                 </div>
                 <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={300}
                    className="w-full h-40 p-6 bg-slate-50 border-2 border-transparent rounded-4xl outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-medium placeholder:text-slate-300 resize-none"
                    placeholder={t('日本やベトナムとの関わりについて教えてください...', 'Hãy chia sẻ về mối quan hệ của bạn với Nhật Bản hoặc Việt Nam...')}
                 />
              </section>

              {/* Residence Area */}
              <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                 <div className="mb-6">
                    <h3 className="text-lg font-extrabold text-slate-900 mb-1">{t('ハノイの居住エリア', 'Khu vực cư trú tại Hà Nội')}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Living Area in Hanoi / Khu vực sinh sống tại Hà Nội</p>
                 </div>
                 <div className="relative group">
                    <select
                      value={livingArea}
                      onChange={(e) => setLivingArea(e.target.value)}
                      className="w-full pl-6 pr-12 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                    >
                       <option value="">{t('選択してください', 'Vui lòng chọn')}</option>
                       <option value="Ba Dinh">{t('バーディン区 (Ba Đình)', 'Quận Ba Đình (Ba Đình)')}</option>
                       <option value="Hoan Kiem">{t('ホアンキエム区 (Hoàn Kiếm)', 'Quận Hoàn Kiếm (Hoàn Kiếm)')}</option>
                       <option value="Hai Ba Trung">{t('ハイバーチュン区 (Hai Bà Trưng)', 'Quận Hai Bà Trưng (Hai Bà Trưng)')}</option>
                       <option value="Dong Da">{t('ドンダー区 (Đống Đa)', 'Quận Đống Đa (Đống Đa)')}</option>
                       <option value="Tay Ho">{t('タイホー区 (Tây Hồ)', 'Quận Tây Hồ (Tây Hồ)')}</option>
                       <option value="Cau Giay">{t('カウザイ区 (Cầu Giấy)', 'Quận Cầu Giấy (Cầu Giấy)')}</option>
                       <option value="Thanh Xuan">{t('タインスアン区 (Thanh Xuân)', 'Quận Thanh Xuân (Thanh Xuân)')}</option>
                       <option value="Ha Dong">{t('ハドン区 (Hà Đông)', 'Quận Hà Đông (Hà Đông)')}</option>
                       <option value="Bac Tu Liem">{t('バクトゥーリエム区 (Bắc Từ Liêm)', 'Quận Bắc Từ Liêm (Bắc Từ Liêm)')}</option>
                       <option value="Nam Tu Liem">{t('ナムトゥーリエム区 (Nam Từ Liêm)', 'Quận Nam Từ Liêm (Nam Từ Liêm)')}</option>
                       <option value="My Duc">{t('ミーデュック県 (Mỹ Đức)', 'Huyện Mỹ Đức (Mỹ Đức)')}</option>
                       <option value="Dan Phuong">{t('ダンフォン県 (Dân Phương)', 'Huyện Đan Phượng (Dân Phương)')}</option>
                       <option value="Thuong Tin">{t('トゥオンティン県 (Thượng Tín)', 'Huyện Thượng Tín (Thượng Tín)')}</option>
                       <option value="Hoai Duc">{t('ホアイドゥック県 (Hoài Đức)', 'Huyện Hoài Đức (Hoài Đức)')}</option>
                       <option value="Quoc Oai">{t('クォックオアイ県 (Quốc Oai)', 'Huyện Quốc Oai (Quốc Oai)')}</option>
                       <option value="Phu Xuyen">{t('フーズエン県 (Phú Xuyên)', 'Huyện Phú Xuyên (Phú Xuyên)')}</option>
                       <option value="Soc Son">{t('ソックソン県 (Sóc Sơn)', 'Huyện Sóc Sơn (Sóc Sơn)')}</option>
                       <option value="Me Linh">{t('メーリン県 (Mê Linh)', 'Huyện Mê Linh (Mê Linh)')}</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:text-[#0F4186] transition-colors" />
                 </div>
              </section>

              {/* Language Level */}
              <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                 <div className="mb-10">
                    <h3 className="text-lg font-extrabold text-slate-900 mb-1">{t('語学能力', 'Năng lực ngôn ngữ')}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Language Proficiency / Năng lực ngôn ngữ</p>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 pl-1">{t('日本語レベル (JLPT)', 'Trình độ tiếng Nhật (JLPT)')}</label>
                        <div className="relative group">
                           <select
                             value={japaneseLevel}
                             onChange={(e) => setJapaneseLevel(e.target.value)}
                             className="w-full pl-6 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                           >
                              <option value="">{t('選択してください', 'Vui lòng chọn')}</option>
                              <option value="N1">{t('N1 - ビジネスレベル', 'N1 - Trình độ công việc')}</option>
                              <option value="N2">{t('N2 - 日常会話レベル', 'N2 - Trình độ hội thoại hàng ngày')}</option>
                              <option value="N3">{t('N3 - 基礎会話', 'N3 - Hội thoại cơ bản')}</option>
                           </select>
                           <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 pl-1">{t('ベトナム語レベル (VSTEP)', 'Trình độ tiếng Việt (VSTEP)')}</label>
                        <div className="relative group">
                           <select
                             value={vietnameseLevel}
                             onChange={(e) => setVietnameseLevel(e.target.value)}
                             className="w-full pl-6 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                           >
                              <option value="">{t('選択してください', 'Vui lòng chọn')}</option>
                              <option value="C1/C2">{t('C1/C2 - 上級', 'C1/C2 - Cao cấp')}</option>
                              <option value="B1/B2">{t('B1/B2 - 中上級', 'B1/B2 - Trung cao cấp')}</option>
                           </select>
                           <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                 </div>
              </section>

              {/* Interests */}
              <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                 <div className="mb-8">
                    <h3 className="text-lg font-extrabold text-slate-900 mb-1">{t('興味・関心', 'Sở thích / Quan tâm')}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Interests / Sở thích</p>
                 </div>
                 <div className="flex flex-wrap gap-3">
                    {interestOptions.map((interest) => {
                       const isSelected = selectedInterests.includes(interest.ja);
                       return (
                          <button
                            type="button"
                            key={interest.ja}
                            onClick={() => handleInterestToggle(interest.ja)}
                            className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${
                               isSelected 
                                 ? 'bg-[#0F4186] text-white border-[#0F4186] shadow-lg shadow-blue-500/10' 
                                 : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                            }`}
                          >
                             {isSelected && <Check className="w-3.5 h-3.5" />}
                             <span>{t(interest.ja, interest.vi)}</span>
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
                   {t('キャンセル', 'Hủy')}
                 </button>
                 <button
                   type="submit"
                   disabled={isSaving}
                   className="px-12 py-5 bg-[#0F4186] text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:-translate-y-1 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isSaving ? t('保存中...', 'Đang lưu...') : t('変更を保存', 'Lưu thay đổi')}
                 </button>
              </div>
           </form>
        </main>

        <footer className="p-8 border-t border-slate-100 flex items-center justify-between opacity-50">
           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Nihonect <span className="font-light">{t('© 2024 Nihonect. ハノイと東京を繋ぐ。', '© 2024 Nihonect. Kết nối Hà Nội và Tokyo.')}</span>
           </div>
           <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest text-slate-400">
              <button className="hover:text-[#0F4186]">{t('プライバシー', 'Quyền riêng tư')}</button>
              <button className="hover:text-[#0F4186]">{t('利用規約', 'Điều khoản sử dụng')}</button>
              <button className="hover:text-[#0F4186]">{t('コミュニティガイドライン', 'Hướng dẫn cộng đồng')}</button>
           </div>
        </footer>
      </div>
    </div>
  );
}
