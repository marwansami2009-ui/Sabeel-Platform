import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GlassIcon } from '../../components/common/GlassIcon';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [center, setCenter] = useState('');
  const [school, setSchool] = useState('');
  const [bio, setBio] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { signUp, signIn } = useAuth();

  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp(phone, password, { 
          firstName, 
          middleName, 
          lastName, 
          birthdate, 
          gender, 
          governorate, 
          center, 
          school, 
          bio 
        });
        
        if (result.success) {
          setShowSuccess(true);
        } else {
          setError(result.error);
        }
      } else {
        const result = await signIn(phone, password);
        if (result.success) {
          window.location.href = '/dashboard';
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      alert("Error: " + err.message);
      setError(err.message);
    }
    setLoading(false);
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

        {showSuccess ? (
          <div className="text-center py-8 animate-scale-in">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500/50">
              <GlassIcon name="check-circle" size={48} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">تم إنشاء حسابك بنجاح! 🎉</h3>
            <p className="text-slate-300 leading-relaxed mb-8">
              تم إنشاء حسابك بنجاح، سيتم مراجعة الحساب وتفعيله في أقرب وقت.
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                setIsSignUp(false);
              }}
              className="w-full bg-white/10 hover:bg-white/20 text-brand-gold py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition"
            >
              <GlassIcon name="arrow-right" size={20} />
              العودة لتسجيل الدخول
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <input 
                    type="text" 
                    placeholder="الاسم الأول" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    className="w-full p-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-brand-gold/50 transition-all text-center"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="اسم الأب" 
                    value={middleName} 
                    onChange={(e) => setMiddleName(e.target.value)} 
                    className="w-full p-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-brand-gold/50 transition-all text-center"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="اسم العائلة" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    className="w-full p-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-brand-gold/50 transition-all text-center"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative group">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-focus-within:text-brand-gold">
                          <GlassIcon name="calendar" size={16} />
                      </div>
                      <input 
                        type="date" 
                        value={birthdate} 
                        onChange={(e) => setBirthdate(e.target.value)} 
                        className="w-full py-3 pr-10 pl-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-brand-gold/50 transition-all text-right [color-scheme:dark]"
                        required
                      />
                  </div>
                  
                  <div className="relative group">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-focus-within:text-brand-gold">
                          <GlassIcon name="users" size={16} />
                      </div>
                      <select 
                        value={gender} 
                        onChange={(e) => setGender(e.target.value)} 
                        className="w-full py-3 pr-10 pl-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-brand-gold/50 transition-all text-right appearance-none"
                        required
                      >
                        <option value="" disabled className="bg-brand-dark">النوع/الجنس</option>
                        <option value="male" className="bg-brand-dark">ذكر</option>
                        <option value="female" className="bg-brand-dark">أنثى</option>
                      </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-focus-within:text-brand-gold">
                        <GlassIcon name="map-pin" size={16} />
                    </div>
                    <select 
                      value={governorate} 
                      onChange={(e) => setGovernorate(e.target.value)} 
                      className="w-full py-3 pr-10 pl-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-brand-gold/50 transition-all text-right appearance-none"
                      required
                    >
                      <option value="" disabled className="bg-brand-dark">المحافظة</option>
                      <option value="Cairo" className="bg-brand-dark">القاهرة</option>
                      <option value="Alexandria" className="bg-brand-dark">الإسكندرية</option>
                      <option value="Giza" className="bg-brand-dark">الجيزة</option>
                      <option value="Other" className="bg-brand-dark">أخرى</option>
                    </select>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-focus-within:text-brand-gold">
                        <GlassIcon name="navigation" size={16} />
                    </div>
                    <select 
                      value={center} 
                      onChange={(e) => setCenter(e.target.value)} 
                      className="w-full py-3 pr-10 pl-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-brand-gold/50 transition-all text-right appearance-none"
                      required
                    >
                      <option value="" disabled className="bg-brand-dark">السنتر/المنطقة</option>
                      <option value="Center A" className="bg-brand-dark">سنتر أ</option>
                      <option value="Center B" className="bg-brand-dark">سنتر ب</option>
                      <option value="Online" className="bg-brand-dark">أونلاين (بدون سنتر)</option>
                    </select>
                  </div>
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-focus-within:text-brand-gold">
                        <GlassIcon name="book" size={16} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="اسم المدرسة (اختياري)" 
                      value={school} 
                      onChange={(e) => setSchool(e.target.value)} 
                      className="w-full py-3 pr-10 pl-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-brand-gold/50 transition-all text-right"
                    />
                </div>

                <div className="relative group">
                    <textarea 
                      placeholder="نبذة عنك (اختياري)..." 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)} 
                      className="w-full p-4 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-brand-gold/50 transition-all text-right resize-none h-20"
                    />
                </div>
              </div>
            )}

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
        )}

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