import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleAuth = async (e) => {
    e.preventDefault(); // ده عشان يمنع الريسترت
    setLoading(true);
    
    const dummyEmail = `${phone}@sabeel.com`;
    console.log("Attempting auth with:", dummyEmail);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(dummyEmail, password, { phone });
      } else {
        result = await signIn(dummyEmail, password);
      }

      if (result.success) {
        alert("تمت العملية بنجاح!");
        window.location.href = '/'; // تحويل يدوي للتأكد
      } else {
        // ده هيطلعلك رسالة سوبابيز الحقيقية في وشك
        alert("فشل: " + result.error);
        console.error(result.error);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <form onSubmit={handleAuth} className="glass-panel p-8 max-w-md w-full">
        <h2 className="text-white text-2xl mb-4 text-center">{isSignUp ? 'إنشاء حساب' : 'دخول'}</h2>
        <input 
          type="tel" 
          placeholder="رقم الهاتف" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          className="w-full p-4 mb-4 bg-white/5 text-white rounded-xl"
          required 
        />
        <input 
          type="password" 
          placeholder="الباسورد" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full p-4 mb-4 bg-white/5 text-white rounded-xl"
          required 
        />
        <button type="submit" disabled={loading} className="btn-main w-full py-4 bg-white text-black font-bold rounded-xl">
          {loading ? 'لحظة...' : (isSignUp ? 'اشتراك' : 'دخول')}
        </button>
        <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-white mt-4 w-full">
          {isSignUp ? 'عندك حساب؟ دخول' : 'جديد؟ اعمل حساب'}
        </button>
      </form>
    </div>
  );
};