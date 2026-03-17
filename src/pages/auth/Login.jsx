import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GlassIcon } from '../../components/common/GlassIcon';

// ─── Input field helper ──────────────────────────────────────────────────────
const Field = ({ icon, children }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500 group-focus-within:text-amber-400 transition-colors z-10">
      <GlassIcon name={icon} size={16} />
    </div>
    {children}
  </div>
);

const inputCls = "w-full py-3 pr-10 pl-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-amber-400/60 focus:bg-white/10 transition-all text-right placeholder:text-slate-500";
const selectCls = inputCls + " appearance-none cursor-pointer";

// ─── Brand panel (left side) ─────────────────────────────────────────────────
const BrandPanel = ({ isSignUp }) => (
  <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-rose-950 via-red-900 to-amber-900 relative overflow-hidden">
    {/* Decorative blobs */}
    <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-amber-500/20 rounded-full blur-[120px]" />
    <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-rose-600/20 rounded-full blur-[120px]" />

    {/* Logo */}
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
          <GlassIcon name="zap" size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-black text-xl leading-tight">سبيل التفوق</h1>
          <p className="text-amber-300/70 text-xs">منصة التعليم الأول</p>
        </div>
      </div>
    </div>

    {/* Central illustration */}
    <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center py-8">
      <div className="w-48 h-48 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-sm shadow-2xl">
        <div className="w-36 h-36 bg-gradient-to-br from-amber-400/30 to-rose-500/30 rounded-full flex items-center justify-center border border-amber-400/30">
          <GlassIcon name={isSignUp ? "user-plus" : "graduation-cap"} size={64} className="text-amber-300" />
        </div>
      </div>
      <h2 className="text-3xl font-black text-white mb-4 leading-tight">
        {isSignUp ? 'ابدأ رحلتك\nنحو التفوق' : 'أهلاً بعودتك\nإلى سبيل التفوق'}
      </h2>
      <p className="text-slate-300/70 text-sm leading-relaxed max-w-xs">
        {isSignUp
          ? 'انضم إلى آلاف الطلاب الذين يحققون أحلامهم مع منصة سبيل التفوق'
          : 'منصة تعليمية متكاملة تساعدك على التفوق والنجاح في رحلتك الدراسية'}
      </p>
    </div>

    {/* Footer stats */}
    <div className="relative z-10 grid grid-cols-3 gap-4">
      {[['📚', 'كورسات', 'متنوعة'], ['🏆', 'نتائج', 'مضمونة'], ['👨‍🏫', 'مدرسين', 'محترفين']].map(([emoji, label, sub]) => (
        <div key={label} className="text-center bg-white/5 rounded-2xl p-3 border border-white/10">
          <div className="text-2xl mb-1">{emoji}</div>
          <div className="text-white font-bold text-sm">{label}</div>
          <div className="text-slate-400 text-xs">{sub}</div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const Login = () => {
  const { signUp, signIn, loginWithCenterCode } = useAuth();

  // View state
  const [isSignUp, setIsSignUp] = useState(false);
  const [isCenterCode, setIsCenterCode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
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
  const [grade, setGrade] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [motherPhone, setMotherPhone] = useState('');
  const [centerCode, setCenterCode] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setError('');
    setPhone(''); setPassword(''); setFirstName(''); setMiddleName('');
    setLastName(''); setBirthdate(''); setGender(''); setGovernorate('');
    setCenter(''); setSchool(''); setBio(''); setGrade('');
    setFatherPhone(''); setMotherPhone(''); setCenterCode('');
  };

  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const result = await signUp(phone, password, {
          firstName, middleName, lastName,
          birthdate, gender, governorate,
          center, school, bio, grade,
          father_phone: fatherPhone,
          mother_phone: motherPhone,
        });
        if (result.success) {
          setShowSuccess(true);
        } else {
          setError(result.error);
        }
      } else if (isCenterCode) {
        const result = await loginWithCenterCode(phone, centerCode);
        if (result.success) {
          window.location.href = '/student';
        } else {
          setError(result.error);
        }
      } else {
        const result = await signIn(phone, password);
        if (result.success) {
          window.location.href = '/student';
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع');
    }
    setLoading(false);
  };

  const switchToLogin = () => { resetForm(); setIsSignUp(false); setIsCenterCode(false); setShowSuccess(false); };
  const switchToSignUp = () => { resetForm(); setIsSignUp(true); setIsCenterCode(false); };
  const toggleCenterCode = () => { resetForm(); setIsCenterCode(!isCenterCode); setIsSignUp(false); };

  return (
    <div className="min-h-screen bg-[#0c0c12] flex" dir="rtl">
      {/* Left: Brand Panel */}
      <div className="lg:w-5/12 xl:w-1/2">
        <BrandPanel isSignUp={isSignUp} />
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 overflow-y-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-rose-500 rounded-xl flex items-center justify-center">
            <GlassIcon name="zap" size={20} className="text-white" />
          </div>
          <h1 className="text-white font-black text-lg">سبيل التفوق</h1>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          {!showSuccess && (
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white mb-2">
                {isSignUp ? 'إنشاء حساب جديد' : isCenterCode ? 'تسجيل بكود السنتر' : 'تسجيل الدخول'}
              </h2>
              <p className="text-slate-400 text-sm">
                {isSignUp
                  ? 'أدخل بياناتك لتنضم إلى منصة سبيل التفوق'
                  : isCenterCode
                  ? 'أدخل رقم هاتفك وكود السنتر الخاص بك'
                  : 'أدخل بيانات حسابك للمتابعة'}
              </p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm animate-slide-up">
              <GlassIcon name="alert-circle" size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Screen */}
          {showSuccess ? (
            <div className="text-center py-8 animate-scale-in">
              <div className="w-24 h-24 bg-green-500/10 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <GlassIcon name="check-circle" size={48} className="text-green-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">تم إنشاء حسابك! 🎉</h3>
              <p className="text-slate-400 leading-relaxed mb-8 text-sm">
                تم إنشاء حسابك بنجاح. سيتم مراجعة الحساب من قِبَل الإدارة وتفعيله في أقرب وقت. ستصلك رسالة عند التفعيل.
              </p>
              <button
                onClick={switchToLogin}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-amber-400 rounded-xl font-bold transition"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">

              {/* ── Signup Extra Fields ── */}
              {isSignUp && (
                <>
                  {/* Name row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { ph: 'الاسم الأول', val: firstName, set: setFirstName },
                      { ph: 'اسم الأب', val: middleName, set: setMiddleName },
                      { ph: 'اسم العائلة', val: lastName, set: setLastName },
                    ].map(({ ph, val, set }) => (
                      <input key={ph} type="text" placeholder={ph} value={val}
                        onChange={(e) => set(e.target.value)} required
                        className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-amber-400/60 transition text-center text-sm placeholder:text-slate-500" />
                    ))}
                  </div>

                  {/* Birthdate + Gender */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field icon="calendar">
                      <input type="date" value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)} required
                        className={inputCls + " [color-scheme:dark]"} />
                    </Field>
                    <Field icon="users">
                      <select value={gender} onChange={(e) => setGender(e.target.value)} required className={selectCls}>
                        <option value="" disabled className="bg-[#0c0c12]">الجنس</option>
                        <option value="male" className="bg-[#0c0c12]">ذكر</option>
                        <option value="female" className="bg-[#0c0c12]">أنثى</option>
                      </select>
                    </Field>
                  </div>

                  {/* Grade */}
                  <Field icon="award">
                    <select value={grade} onChange={(e) => setGrade(e.target.value)} required className={selectCls}>
                      <option value="" disabled className="bg-[#0c0c12]">الصف الدراسي</option>
                      <option value="1sec" className="bg-[#0c0c12]">الصف الأول الثانوي</option>
                      <option value="2sec" className="bg-[#0c0c12]">الصف الثاني الثانوي</option>
                      <option value="3sec" className="bg-[#0c0c12]">الصف الثالث الثانوي</option>
                    </select>
                  </Field>

                  {/* Governorate + Center */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field icon="map-pin">
                      <select value={governorate} onChange={(e) => setGovernorate(e.target.value)} required className={selectCls}>
                        <option value="" disabled className="bg-[#0c0c12]">المحافظة</option>
                        {['القاهرة','الإسكندرية','الجيزة','بورسعيد','السويس','الدقهلية','الشرقية','القليوبية','كفر الشيخ','الغربية','المنوفية','البحيرة','الإسماعيلية','دمياط','شمال سيناء','جنوب سيناء','بني سويف','المنيا','أسيوط','سوهاج','قنا','أسوان','البحر الأحمر','الوادي الجديد','مطروح','الأقصر','الفيوم'].map(g => (
                          <option key={g} value={g} className="bg-[#0c0c12]">{g}</option>
                        ))}
                      </select>
                    </Field>
                    <Field icon="navigation">
                      <select value={center} onChange={(e) => setCenter(e.target.value)} required className={selectCls}>
                        <option value="" disabled className="bg-[#0c0c12]">السنتر</option>
                        <option value="Center A" className="bg-[#0c0c12]">سنتر أ</option>
                        <option value="Center B" className="bg-[#0c0c12]">سنتر ب</option>
                        <option value="Online" className="bg-[#0c0c12]">أونلاين</option>
                      </select>
                    </Field>
                  </div>

                  {/* School */}
                  <Field icon="book">
                    <input type="text" placeholder="اسم المدرسة (اختياري)"
                      value={school} onChange={(e) => setSchool(e.target.value)}
                      className={inputCls} />
                  </Field>

                  {/* ── Parent Phone Numbers ── */}
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-slate-400 text-xs mb-3 flex items-center gap-2">
                      <GlassIcon name="phone-call" size={14} />
                      أرقام هواتف أولياء الأمور
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field icon="phone">
                        <input type="tel" placeholder="رقم هاتف الأب" value={fatherPhone}
                          onChange={(e) => setFatherPhone(e.target.value)} required maxLength={15}
                          className={inputCls} />
                      </Field>
                      <Field icon="phone">
                        <input type="tel" placeholder="رقم هاتف الأم" value={motherPhone}
                          onChange={(e) => setMotherPhone(e.target.value)} required maxLength={15}
                          className={inputCls} />
                      </Field>
                    </div>
                  </div>
                </>
              )}

              {/* ── Student Phone ── */}
              <Field icon="smartphone">
                <input type="tel" placeholder="رقم هاتف الطالب" value={phone}
                  onChange={(e) => setPhone(e.target.value)} required maxLength={15}
                  className={inputCls} />
              </Field>

              {/* ── Password / Center Code ── */}
              <Field icon="lock">
                {isCenterCode ? (
                  <input type="text" placeholder="كود السنتر (مثال: SAB-1234)" value={centerCode}
                    onChange={(e) => setCenterCode(e.target.value.toUpperCase())} required
                    className={inputCls + " tracking-widest text-center"} />
                ) : (
                  <input type="password" placeholder="كلمة المرور" value={password}
                    onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    className={inputCls} />
                )}
              </Field>

              {/* ── Submit Button ── */}
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black rounded-xl shadow-lg shadow-rose-900/40 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 text-sm">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري المعالجة...</>
                ) : (
                  <>{isSignUp ? '🚀 إنشاء الحساب' : isCenterCode ? '🎫 دخول بالكود' : '→ تسجيل الدخول'}</>
                )}
              </button>

              {/* ── Mode Switchers ── */}
              <div className="pt-2 space-y-3">
                {!isSignUp && (
                  <button type="button" onClick={toggleCenterCode}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-amber-400 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2">
                    <GlassIcon name={isCenterCode ? "log-in" : "gift"} size={16} />
                    {isCenterCode ? 'تسجيل الدخول بكلمة المرور' : 'تسجيل بكود السنتر'}
                  </button>
                )}

                {!isCenterCode && (
                  <p className="text-center text-slate-400 text-sm">
                    {isSignUp ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}{' '}
                    <button type="button"
                      onClick={isSignUp ? switchToLogin : switchToSignUp}
                      className="text-amber-400 font-bold hover:text-white transition">
                      {isSignUp ? 'سجل دخولك' : 'أنشئ حساباً'}
                    </button>
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};