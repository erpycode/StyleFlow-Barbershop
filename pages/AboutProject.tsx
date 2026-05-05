import React from 'react';
import { useLanguage } from '../services/LanguageContext';
import { Github, Linkedin, Mail, ExternalLink, Code2, Database, Layout } from 'lucide-react';
import { motion } from 'motion/react';

const AboutProject: React.FC = () => {
  const { t, language, isRtl } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-black text-white">StyleFlow Barbershop</h1>
        <p className="text-amber-500 font-bold tracking-widest text-xs uppercase bg-amber-500/10 px-4 py-1 rounded-full inline-block">
          {language === 'fa' ? 'اثر هنری مدرن از' : 'A Modern Digital Craft by'} @ErPyCode
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 space-y-6"
        >
          <div className="flex items-center gap-4 text-white">
            <Layout className="text-amber-500" />
            <h2 className="text-xl font-bold">{language === 'fa' ? 'درباره پروژه' : 'About Project'}</h2>
          </div>
          <p className="text-slate-400 leading-relaxed">
            {language === 'fa' 
              ? 'استایل‌فلو یک پروژه کامل و مدرن برای مدیریت نوبت‌دهی آرایشگاه است. این پروژه با هدف نمایش مهارت‌های توسعه فرانت‌اند و ادغام ابزارهای مدرن ساخته شده است.'
              : 'StyleFlow is a complete and modern project for managing barbershop appointments. It was built to showcase frontend development skills and modern tool integration.'}
          </p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-2">✓ {language === 'fa' ? 'پشتیبانی کامل از دو زبان و RTL' : 'Full Bilingual and RTL support'}</li>
            <li className="flex items-center gap-2">✓ {language === 'fa' ? 'سیستم مدیریت نوبت‌ها' : 'Appointment Management System'}</li>
            <li className="flex items-center gap-2">✓ {language === 'fa' ? 'هوش مصنوعی Gemini برای مشاوره' : 'Gemini AI for consultation'}</li>
            <li className="flex items-center gap-2">✓ {language === 'fa' ? 'طراحی ریسپانسیو و Dark Mode' : 'Responsive Design & Dark Mode'}</li>
          </ul>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 space-y-6"
        >
          <div className="flex items-center gap-4 text-white">
            <Code2 className="text-amber-500" />
            <h2 className="text-xl font-bold">{language === 'fa' ? 'تکنولوژی‌ها' : 'Tech Stack'}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Tailwind CSS', 'Motion', 'Lucide Icons', 'LocalStorage'].map(tech => (
              <span key={tech} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs border border-slate-700">
                {tech}
              </span>
            ))}
          </div>
          <div className="pt-4 space-y-4">
             <div className="flex items-center gap-3 text-slate-300">
                <Database size={18} className="text-amber-500" />
                <span className="text-sm">{language === 'fa' ? 'قابلیت اتصال به دیتابیس هوشمند' : 'Ready for Cloud Database'}</span>
             </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-3xl text-center space-y-6"
      >
        <h2 className="text-2xl font-bold text-white">{language === 'fa' ? 'ارتباط با من' : 'Connect with Me'}</h2>
        <div className="flex justify-center flex-wrap gap-4">
          <a href="https://github.com/ErPyCode" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 bg-slate-900 rounded-2xl text-slate-300 hover:text-white transition-all hover:scale-105 border border-slate-800">
            <Github size={20} />
            <span className="text-sm font-medium">GitHub</span>
          </a>
          <a href="https://instagram.com/ErPyCode" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 bg-slate-900 rounded-2xl text-slate-300 hover:text-white transition-all hover:scale-105 border border-slate-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            <span className="text-sm font-medium">Instagram</span>
          </a>
          <a href="https://t.me/ErPyCode" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 bg-slate-900 rounded-2xl text-slate-300 hover:text-white transition-all hover:scale-105 border border-slate-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            <span className="text-sm font-medium">Telegram</span>
          </a>
          <a href="mailto:ErPyCode@gmail.com" className="flex items-center gap-2 px-5 py-3 bg-slate-900 rounded-2xl text-slate-300 hover:text-white transition-all hover:scale-105 border border-slate-800">
            <Mail size={20} />
            <span className="text-sm font-medium">Email</span>
          </a>
        </div>
        <p className="text-slate-400 text-sm">
          {language === 'fa' 
            ? 'اگر از این پروژه خوشتان آمد، با ستاره دادن در گیت‌هاب حمایت کنید.'
            : 'If you like this project, support it by giving a star on GitHub.'}
        </p>
      </motion.div>
    </div>
  );
};

export default AboutProject;
