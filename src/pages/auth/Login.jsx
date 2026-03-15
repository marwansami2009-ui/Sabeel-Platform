import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GlassIcon } from '../../components/common/GlassIcon';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { signUp, signIn } = useAuth();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    // Clean up phone number from any spaces
    const cleanPhone = phone.trim().replace(/\s/g, '');
    const dummyEmail = `${cleanPhone}@sabeel.com`;

    try {
      let result;
      if (isSignUp) {
        result = await signUp(cleanPhone, password, { 
            name: '', 
            phone: cleanPhone 
        });
      } else {
        result = await signIn(cleanPhone, password);
      }

      if (result.success) {
        if(isSignUp) {
            setSuccessMessage('تم إنشاء حسابك بنجاح! حسابك قيد المراجعة الرجاء انتظار التفعيل.');
            setTimeout(() => {
                setSuccessMessage('');
                setIsSignUp(false);
                setPhone('');
                setPassword('');
            }, 5000);
        } else {
            // Success Sign in
            window.location.href = '/'; 
        }
      } else {
         setError(result.error || 'حدث خطأ، يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-red/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-gold/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="glass-panel p-8 max-w-md w-full relative z-10 animate-slide-up bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl">
        
        {/* Logo/Icon Area */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-red to-brand-gold rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-red/20">
            <GlassIcon name={isSignUp ? "user-plus" : "log-in"} size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            {isSignUp ? 'حساب جديد' : 'تسجيل الدخول'}
          </h2>
          <p className="text-slate-400 text-sm">
            {isSignUp ? 'انضم إلى منصة سبيل التفوق الآن' : 'مرحباً بعودتك يا بطل'}
          </p>
        </div>

        {/* Message Alerts */}
        {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm font-medium animate-shake">
                <GlassIcon name="alert-circle" size={16} className="inline mr-2" />
                {error}
            </div>
        )}
        
        {successMessage && (
            <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-center text-sm font-medium animate-scale-in">
                <GlassIcon name="check-circle" size={16} className="inline mr-2" />
                {successMessage}
            </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
            <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-brand-gold transition-colors">
                    <GlassIcon name="phone" size={18} />
                </div>
                <input 
                type="tel" 
                placeholder="رقم الهاتف" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="w-full py-4 pr-12 pl-4 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-brand-gold/50 focus:bg-black/40 transition-all placeholder:text-slate-500 text-right"
                required 
                maxLength={15}
                />
            </div>

            <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-brand-gold transition-colors">
                    <GlassIcon name="lock" size={18} />
                </div>
                <input 
                type="password" 
                placeholder="كلمة المرور" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full py-4 pr-12 pl-4 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-brand-gold/50 focus:bg-black/40 transition-all placeholder:text-slate-500 text-right"
                required 
                minLength={6}
                />
            </div>
            
            <button 
                type="submit" 
                disabled={loading} 
                className="relative w-full overflow-hidden group rounded-xl font-bold text-white shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-red to-brand-gold transition-transform duration-300 group-hover:scale-[1.05]"></div>
                <div className="relative py-4 flex items-center justify-center gap-2">
                    {loading ? (
                         <>
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                         لحظة...
                         </>
                    ) : (
                        <>
                            {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
                            <GlassIcon name="arrow-left" size={18} className="group-hover:-translate-x-1 transition-transform" />
                        </>
                    )}
                </div>
            </button>
        </form>

        <div className="mt-8 text-center text-sm">
            <span className="text-slate-400">
                {isSignUp ? 'لديك حساب بالفعل؟ ' : 'ليس لديك حساب بعد؟ '}
            </span>
            <button 
                type="button" 
                onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setSuccessMessage('');
                }} 
                className="text-brand-gold hover:text-white font-bold transition-colors underline-offset-4 hover:underline"
            >
                {isSignUp ? 'سجل دخولك الآن' : 'قم بإنشاء حساب جديد'}
            </button>
        </div>
      </div>
    </div>
  );
};