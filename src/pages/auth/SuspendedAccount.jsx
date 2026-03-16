import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GlassIcon } from '../../components/common/GlassIcon';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const SuspendedAccount = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4 py-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/20 rounded-full blur-[100px] animate-pulse"></div>
      
      <div className="glass-panel p-8 w-full max-w-lg text-center relative z-10 animate-slide-up border border-red-500/20">
        <div className="absolute top-4 left-4">
          <ThemeToggle isDark={true} onToggle={() => {}} />
        </div>

        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-500/50">
          <GlassIcon name="alert-triangle" size={48} className="text-red-500" />
        </div>
        
        <h2 className="text-3xl font-black mb-4 text-white">حسابك موقوف ⚠️</h2>
        
        <p className="mb-8 text-slate-300 leading-relaxed">
          عذراً، تم إيقاف حسابك من قبل الإدارة. لا يمكنك الوصول إلى محتوى المنصة في الوقت الحالي.
          يرجى التواصل مع الدعم الفني أو السنتر لمزيد من التفاصيل أو لحل المشكلة.
        </p>

        <button
          onClick={signOut}
          className="w-full bg-white/10 hover:bg-white/20 text-brand-red py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition"
        >
          <GlassIcon name="log-out" size={20} />
          تسجيل الخروج والعودة للرئيسية
        </button>
      </div>
    </div>
  );
};
