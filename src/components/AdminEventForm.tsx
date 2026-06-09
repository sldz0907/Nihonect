import React, { useState, useRef } from 'react';
import { Upload, Calendar, MapPin, Tag, FileText, Type, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function AdminEventForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('文化交流');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('無料');
  const [format, setFormat] = useState('オフライン');
  const [languageRequirement, setLanguageRequirement] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || !location || !imageFile) {
      alert('すべての必須項目を入力し、画像を選択してください。');
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('date', date);
      formData.append('location', location);
      formData.append('category', category);
      formData.append('capacity', capacity);
      formData.append('price', price);
      formData.append('format', format);
      formData.append('languageRequirement', languageRequirement);
      formData.append('image', imageFile);

      const res = await fetch(`${API_BASE_URL}/api/admin/events`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setSuccessMsg('イベントが正常に作成されました！');
        setTitle('');
        setDescription('');
        setDate('');
        setLocation('');
        setCapacity('');
        setPrice('無料');
        setFormat('オフライン');
        setLanguageRequirement('');
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const error = await res.json();
        alert(`エラー: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('サーバーエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">イベント作成</h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Create New Event</p>
      </div>

      {successMsg && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-bold text-sm flex items-center justify-center shadow-sm">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-10">
        
        {/* Cover Image Upload */}
        <div className="mb-10">
          <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 pl-2">カバー画像 <span className="text-rose-500">*</span></label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-64 rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${imagePreview ? 'border-transparent' : 'border-slate-300 hover:border-[#0F4186] hover:bg-slate-50'}`}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-bold text-sm bg-black/40 px-6 py-2 rounded-full backdrop-blur-md">画像を変更</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-50 group-hover:text-[#0F4186] transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#0F4186]" />
                </div>
                <p className="text-sm font-bold text-slate-600">クリックして画像をアップロード</p>
                <p className="text-xs text-slate-400 mt-2">JPEG, PNG, WebP (推奨: 1200x600)</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="col-span-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 pl-2">
              <Type className="w-4 h-4 text-[#0F4186]" /> イベント名 <span className="text-rose-500">*</span>
            </label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-bold text-slate-800" 
              placeholder="例：東京サクラウォーク 2024" 
            />
          </div>

          <div className="col-span-1">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 pl-2">
              <Calendar className="w-4 h-4 text-[#0F4186]" /> 日付 <span className="text-rose-500">*</span>
            </label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-bold text-slate-800" 
            />
          </div>

          <div className="col-span-1">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 pl-2">
              <Tag className="w-4 h-4 text-[#0F4186]" /> カテゴリ <span className="text-rose-500">*</span>
            </label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-bold text-slate-800 appearance-none cursor-pointer"
            >
              <option value="文化交流">文化交流</option>
              <option value="言語交換">言語交換</option>
              <option value="ビジネス">ビジネス</option>
              <option value="エンタメ">エンタメ</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 pl-2">
              <Type className="w-4 h-4 text-[#0F4186]" /> 定員 (任意)
            </label>
            <input 
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-bold text-slate-800" 
              placeholder="例：50" 
            />
          </div>

          <div className="col-span-1">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 pl-2">
              <Tag className="w-4 h-4 text-[#0F4186]" /> 参加費 (任意)
            </label>
            <input 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-bold text-slate-800" 
              placeholder="例：無料, 500円" 
            />
          </div>

          <div className="col-span-1">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 pl-2">
              <MapPin className="w-4 h-4 text-[#0F4186]" /> 開催形式 <span className="text-rose-500">*</span>
            </label>
            <select 
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-bold text-slate-800 appearance-none cursor-pointer"
            >
              <option value="オフライン">オフライン (Offline)</option>
              <option value="オンライン">オンライン (Online)</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 pl-2">
              <FileText className="w-4 h-4 text-[#0F4186]" /> 言語要件 (任意)
            </label>
            <input 
              value={languageRequirement}
              onChange={(e) => setLanguageRequirement(e.target.value)}
              className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-bold text-slate-800" 
              placeholder="例：N3以上" 
            />
          </div>

          <div className="col-span-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 pl-2">
              <MapPin className="w-4 h-4 text-[#0F4186]" /> 場所 <span className="text-rose-500">*</span>
            </label>
            <input 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-bold text-slate-800" 
              placeholder="例：代々木公園" 
            />
          </div>

          <div className="col-span-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 pl-2">
              <FileText className="w-4 h-4 text-[#0F4186]" /> 説明 <span className="text-rose-500">*</span>
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-40 p-6 bg-slate-50 border-2 border-transparent rounded-[32px] outline-none focus:bg-white focus:border-[#0F4186] transition-all text-sm font-medium text-slate-800 resize-none" 
              placeholder="イベントの詳細な説明を入力してください..." 
            />
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-10 py-5 bg-[#0F4186] text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all text-[11px] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center min-w-[200px]"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'イベントを公開する'}
          </button>
        </div>

      </form>
    </div>
  );
}
