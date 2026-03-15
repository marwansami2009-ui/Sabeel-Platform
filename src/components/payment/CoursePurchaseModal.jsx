import React, { useState } from 'react';
import { GlassIcon } from '../common/GlassIcon';
import { createPaymentRequest, validateCenterCode, useCenterCode } from '../../services/supabaseService';

export const CoursePurchaseModal = ({ course, onClose, user, userData, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: details, 2: payment methods, 3: code entry
  const [paymentMethod, setPaymentMethod] = useState('vodafone');
  const [receiptImage, setReceiptImage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [centerCode, setCenterCode] = useState('');
  const [codeValidating, setCodeValidating] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const teacherNumber = '010xxxxxxxx'; // Replace with actual number
  const vodafoneCashNumber = '010xxxxxxxx'; // Replace with actual number
  const instapayUsername = '@teacher'; // Replace with actual username

  const handleCodeSubmit = async () => {
    if (!centerCode.trim()) {
      setCodeError('الرجاء إدخال الكود');
      return;
    }

    setCodeValidating(true);
    setCodeError('');

    const result = await validateCenterCode(centerCode.toUpperCase());
    
    if (!result.valid) {
      setCodeError(result.message);
      setCodeValidating(false);
      return;
    }

    if (result.courseId !== course.id) {
      setCodeError('هذا الكود غير صالح لهذا الكورس');
      setCodeValidating(false);
      return;
    }

    // Use the code
    const useResult = await useCenterCode(centerCode.toUpperCase(), user.uid || user.id);
    
    if (useResult.success) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } else {
      setCodeError(useResult.message);
    }

    setCodeValidating(false);
  };

  const handlePaymentSubmit = async () => {
    if (paymentMethod === 'vodafone' && !transactionId) {
      alert('الرجاء إدخال رقم العملية');
      return;
    }

    if (paymentMethod === 'instapay' && !receiptImage) {
      alert('الرجاء إدخال رابط صورة الإيصال');
      return;
    }

    setLoading(true);

    // For vodafone cash, store transaction ID as receipt
    const receipt = paymentMethod === 'vodafone' ? transactionId : receiptImage;
    
    const result = await createPaymentRequest({
      user_id: user.uid || user.id,
      course_id: course.id,
      receipt_image: receipt
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/95 z-[300] flex items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <GlassIcon name="check-circle" size={40} className="text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">تم إرسال الطلب بنجاح!</h3>
          <p className="text-slate-400">سيتم تفعيل الكورس بعد مراجعة الإدارة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-panel p-6 w-full max-w-lg relative animate-scale-in" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-full">
          <GlassIcon name="x" size={20} />
        </button>

        {step === 1 && (
          <div className="space-y-6">
            <div className="h-48 rounded-xl overflow-hidden relative">
              <img src={course.image} className="w-full h-full object-cover" alt={course.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <h2 className="text-2xl font-bold text-white">{course.title}</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-xl">
                <h3 className="font-bold text-brand-accent mb-2">مميزات الكورس:</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{course.description}</p>
              </div>

              <div className="flex justify-between items-center text-sm font-bold">
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg">{course.duration} يوم</span>
                <span className="text-3xl text-green-400">{course.price} <span className="text-sm">ج.م</span></span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 btn-main py-4 rounded-xl font-bold">
                دفع يدوي
              </button>
              <button onClick={() => setStep(3)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold">
                لدي كود سنتر
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center">اختر طريقة الدفع</h3>

            <div className="space-y-4">
              <div 
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  paymentMethod === 'vodafone' 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-white/10 hover:border-green-500/50'
                }`}
                onClick={() => setPaymentMethod('vodafone')}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'vodafone' ? 'border-green-500 bg-green-500' : 'border-white/30'
                  }`}>
                    {paymentMethod === 'vodafone' && '✓'}
                  </div>
                  <GlassIcon name="smartphone" size={24} className="text-green-500" />
                  <div>
                    <h4 className="font-bold">فودافون كاش</h4>
                    <p className="text-sm text-slate-400">رقم المحفظة: {vodafoneCashNumber}</p>
                  </div>
                </div>
              </div>

              <div 
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  paymentMethod === 'instapay' 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-white/10 hover:border-blue-500/50'
                }`}
                onClick={() => setPaymentMethod('instapay')}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'instapay' ? 'border-blue-500 bg-blue-500' : 'border-white/30'
                  }`}>
                    {paymentMethod === 'instapay' && '✓'}
                  </div>
                  <GlassIcon name="send" size={24} className="text-blue-500" />
                  <div>
                    <h4 className="font-bold">إنستا باي</h4>
                    <p className="text-sm text-slate-400">اليوزر نيم: {instapayUsername}</p>
                  </div>
                </div>
              </div>
            </div>

            {paymentMethod === 'vodafone' && (
              <div>
                <label className="block text-sm font-bold mb-2">رقم العملية</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="أدخل رقم العملية من رسالة فودافون كاش"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                />
              </div>
            )}

            {paymentMethod === 'instapay' && (
              <div>
                <label className="block text-sm font-bold mb-2">رابط صورة الإيصال</label>
                <input
                  type="url"
                  value={receiptImage}
                  onChange={(e) => setReceiptImage(e.target.value)}
                  placeholder="ارفع الصورة على أي موقع وانسخ الرابط"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                />
              </div>
            )}

            <div className="bg-yellow-500/10 p-4 rounded-xl text-sm text-yellow-200">
              <p>⚠️ بعد إرسال الطلب، انتظر موافقة الإدارة ليتم تفعيل الكورس</p>
            </div>

            <button
              onClick={handlePaymentSubmit}
              disabled={loading}
              className="btn-main w-full py-4 rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال طلب الدفع'}
            </button>

            <button onClick={() => setStep(1)} className="w-full py-3 bg-white/10 rounded-xl font-bold">
              رجوع
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center">أدخل كود السنتر</h3>

            <div className="bg-blue-500/10 p-4 rounded-xl text-center">
              <GlassIcon name="gift" size={32} className="mx-auto mb-2 text-blue-400" />
              <p className="text-sm text-slate-300">إذا كان لديك كود مخفض من السنتر، أدخله هنا</p>
            </div>

            <input
              type="text"
              value={centerCode}
              onChange={(e) => setCenterCode(e.target.value.toUpperCase())}
              placeholder="مثال: C123ABC456"
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-center text-2xl tracking-widest"
              maxLength={12}
            />

            {codeError && <p className="text-red-400 text-sm text-center">{codeError}</p>}

            <button
              onClick={handleCodeSubmit}
              disabled={codeValidating}
              className="btn-main w-full py-4 rounded-xl font-bold disabled:opacity-50"
            >
              {codeValidating ? 'جاري التحقق...' : 'تفعيل الكود'}
            </button>

            <button onClick={() => setStep(1)} className="w-full py-3 bg-white/10 rounded-xl font-bold">
              رجوع
            </button>
          </div>
        )}
      </div>
    </div>
  );
};