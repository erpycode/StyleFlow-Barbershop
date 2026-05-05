import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../../services/geminiService';
import { ImagePlus, Loader2, Download, Scissors, Sparkles, RefreshCcw } from 'lucide-react';

const HAIRSTYLES = [
  { id: 'fade', name: 'فید کلاسیک (Fade)', prompt: 'high skin fade haircut, classic barbershop style' },
  { id: 'pompadour', name: 'پمپادور (Pompadour)', prompt: 'classic pompadour hairstyle, volumetric and slicked back' },
  { id: 'buzz', name: 'باز کات (Buzz Cut)', prompt: 'short military buzz cut hairstyle' },
  { id: 'curly', name: 'فر کوتاه (Short Curly)', prompt: 'short curly hair men hairstyle, modern look' },
  { id: 'slick', name: 'اسلیک بک (Slick Back)', prompt: 'slick back hairstyle, gentleman look' },
  { id: 'long', name: 'موی بلند (Long Flow)', prompt: 'long wavy hair flow hairstyle men' },
];

const AIStudio: React.FC = () => {
  // Try-On State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [isProcessingTryOn, setIsProcessingTryOn] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setTryOnImage(null);
        setSelectedStyle(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = async (styleId: string) => {
    if (!uploadedImage) return;
    
    const style = HAIRSTYLES.find(s => s.id === styleId);
    if (!style) return;

    setSelectedStyle(styleId);
    setIsProcessingTryOn(true);
    setTryOnImage(null);
    
    // Construct a specific prompt for hair editing while preserving the face
    const prompt = `Change the person's hairstyle to ${style.prompt}. Keep the face, skin tone, and background exactly the same. Only change the hair. Realistic photo quality.`;

    try {
      const result = await editImageWithGemini(uploadedImage, prompt);
      setTryOnImage(result);
    } catch (error) {
      alert('خطا در پردازش تصویر.');
      setSelectedStyle(null);
    } finally {
      setIsProcessingTryOn(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-black text-white">استودیو هوش مصنوعی آرسس</h2>
        <p className="text-slate-400">مدل موی جدید خود را قبل از کوتاهی ببینید!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
            <div className="space-y-6">
                 <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <ImagePlus className="text-amber-500" />
                        ۱. آپلود تصویر چهره
                    </h3>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-slate-800/50 transition-all min-h-[300px] relative overflow-hidden group"
                        >
                        {uploadedImage ? (
                            <img src={uploadedImage} alt="Upload" className="w-full h-full object-cover absolute inset-0 rounded-2xl opacity-50 group-hover:opacity-40 transition-opacity" />
                        ) : null}
                        
                        <div className="relative z-10 flex flex-col items-center gap-4 text-slate-400 group-hover:text-white transition-colors">
                            <div className="p-4 bg-slate-800 rounded-full group-hover:bg-amber-600 transition-colors shadow-lg">
                                {uploadedImage ? <RefreshCcw size={32} /> : <ImagePlus size={32} />}
                            </div>
                            <span className="font-medium text-lg">{uploadedImage ? 'تغییر تصویر' : 'برای آپلود کلیک کنید'}</span>
                            <span className="text-xs text-slate-500 text-center max-w-[200px]">یک تصویر واضح و روبرو از چهره خود انتخاب کنید</span>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>
                 </div>

                 {uploadedImage && (
                     <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl animate-in fade-in">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Scissors className="text-amber-500" />
                            ۲. انتخاب مدل مو
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {HAIRSTYLES.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => handleTryOn(style.id)}
                                    disabled={isProcessingTryOn}
                                    className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between h-24 ${
                                        selectedStyle === style.id 
                                        ? 'bg-amber-600 border-amber-500 text-white shadow-lg scale-105' 
                                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                                    }`}
                                >
                                    <span className="font-bold">{style.name}</span>
                                    {selectedStyle === style.id && isProcessingTryOn && <Loader2 size={16} className="animate-spin self-end" />}
                                </button>
                            ))}
                        </div>
                     </div>
                 )}
            </div>

            <div className="space-y-6">
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl h-full flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="text-purple-500" />
                        ۳. نتیجه هوش مصنوعی
                    </h3>
                    
                    <div className="flex-1 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden min-h-[400px]">
                        {!uploadedImage ? (
                            <div className="text-center text-slate-600 px-8">
                                <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                                <p>لطفا ابتدا تصویر خود را آپلود کنید</p>
                            </div>
                        ) : isProcessingTryOn ? (
                            <div className="text-center text-amber-500 px-8 animate-pulse">
                                <Loader2 size={48} className="mx-auto mb-4 animate-spin" />
                                <p className="font-bold text-lg">در حال پردازش مدل مو...</p>
                                <p className="text-sm text-slate-500 mt-2">این عملیات ممکن است چند ثانیه طول بکشد</p>
                            </div>
                        ) : tryOnImage ? (
                            <>
                                <img src={tryOnImage} alt="Try On Result" className="w-full h-full object-contain" />
                                <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                                    <a 
                                        href={tryOnImage} 
                                        download="arses-hair-tryon.png" 
                                        className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold shadow-2xl hover:bg-slate-200 transition-colors flex items-center gap-2"
                                    >
                                        <Download size={20} /> دانلود تصویر
                                    </a>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-slate-500 px-8">
                                <p>یک مدل مو را انتخاب کنید تا نتیجه را ببینید</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AIStudio;