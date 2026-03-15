import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GlassIcon } from '../../components/common/GlassIcon';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const Login = ({ onToggleMode }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const { signUp, signIn, resetPassword } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const result = await signInWithGoogle();
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSignUp) {
      const result = await signUp(phone, password, { name: '', phone });
      if (!result.success) {
        setError(result.error);
      }
    } else {
      const result = await signIn(phone, password);
      if (!result.success) {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetMessage('');

    const result = await resetPassword(resetEmail);
    if (result.success) {
      setResetMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      setTimeout(() => setShowReset(false), 3000);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (showReset) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md w-full animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-accent/30">
              <span className="text-4xl">🔐</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">إعادة تعيين كلمة المرور</h2>
          </div>

          <form onSubmit={handlePasswordReset}>
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl mb-4 text-white"
              required
            />

            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
            {resetMessage && <p className="text-green-400 text-sm mb-4 text-center">{resetMessage}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-main w-full py-4 rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
            </button>
          </form>

          <button
            onClick={() => setShowReset(false)}
            className="mt-4 w-full py-3 bg-white/10 rounded-xl font-bold text-sm text-white"
          >
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="glass-panel p-8 max-w-md w-full animate-slide-up">
        <div className="absolute top-4 left-4">
          <ThemeToggle isDark={true} onToggle={() => {}} />
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-accent/30">
            <span className="text-4xl">♞</span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">
            {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
          </h2>
          <p className="text-slate-400 text-sm">
            {isSignUp ? 'أنشئ حسابك وابدأ رحلة التفوق' : 'سجل دخولك للوصول إلى محتوى المنصة'}
          </p>
        </div>


        {/* Phone/Password Form */}
        <form onSubmit={handleEmailAuth}>
          <input
            type="tel"
            placeholder="رقم الهاتف"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl mb-4 text-white text-right"
            required
            maxLength={11}
          />

          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl mb-4 text-white"
            required
            minLength={6}
          />

          {!isSignUp && (
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="text-sm text-brand-accent hover:underline mb-4 block"
            >
              نسيت كلمة المرور؟
            </button>
          )}

          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-main w-full py-4 rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? 'جاري التحميل...' : (isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول')}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-4 w-full py-3 bg-white/10 rounded-xl font-bold text-sm text-white"
        >
          {isSignUp ? 'لديك حساب بالفعل؟ سجل دخولك' : 'ليس لديك حساب؟ أنشئ حساب جديد'}
        </button>
      </div>
    </div>
  );
};