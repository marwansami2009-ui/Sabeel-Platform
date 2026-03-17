import React, { useState, useEffect } from 'react';
import { GlassIcon } from '../common/GlassIcon';
import { 
  getPaymentRequests, 
  updatePaymentRequest 
} from '../../services/appwriteService';

export const PaymentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    const response = await getPaymentRequests(filter);
    if (response.success && response.data) {
      const formatted = response.data.map(req => ({
        id: req.id || req.requestId,
        userId: req.payerId || req.user_id,
        userName: req.profiles?.firstName || req.profiles?.name || 'غير معروف',
        userPhone: req.profiles?.phone || '',
        courseId: req.course_id,
        courseName: req.courses?.title || '',
        coursePrice: req.amount || req.courses?.price || 0,
        receiptImage: req.receipt_image,
        status: req.requestStatus,
        createdAt: new Date(req.requestDate).getTime()
      }));
      setRequests(formatted);
    } else {
      setRequests([]);
    }
    setLoading(false);
  };

  const handleApprove = async (request) => {
    if (confirm(`تأكيد الموافقة على طلب ${request.userName}؟`)) {
      await updatePaymentRequest(request.id, { requestStatus: 'approved' });
      loadRequests();
    }
  };

  const handleReject = async (requestId) => {
    if (confirm('تأكيد رفض الطلب؟')) {
      await updatePaymentRequest(requestId, { requestStatus: 'rejected' });
      loadRequests();
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <GlassIcon name="credit-card" size={24} /> طلبات الدفع
        </h2>

        <div className="flex gap-2">
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-bold transition ${
                filter === status 
                  ? 'bg-brand-primary text-white' 
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {status === 'pending' && 'قيد الانتظار'}
              {status === 'approved' && 'تمت الموافقة'}
              {status === 'rejected' && 'مرفوضة'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <GlassIcon name="loader" size={32} className="mx-auto mb-4 animate-spin" />
          <p>جاري التحميل...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <GlassIcon name="inbox" size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-slate-400">لا توجد طلبات</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="glass-panel p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center">
                    <span className="text-xl">💰</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{request.userName}</h4>
                    <p className="text-sm text-slate-400">{request.userPhone}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                        {request.courseName}
                      </span>
                      <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                        {request.coursePrice} ج.م
                      </span>
                      <span className="bg-white/10 px-2 py-1 rounded text-xs">
                        {new Date(request.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    {request.receiptImage && (
                      <div className="mt-3">
                        <p className="text-xs font-bold mb-1">رقم العملية / رابط الإيصال:</p>
                        <a 
                          href={request.receiptImage.startsWith('http') ? request.receiptImage : '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-brand-accent hover:underline break-all"
                        >
                          {request.receiptImage}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {filter === 'pending' && (
                  <div className="flex gap-2 self-start">
                    <button
                      onClick={() => handleApprove(request)}
                      className="bg-green-500/20 hover:bg-green-500 text-green-300 hover:text-white px-6 py-2 rounded-xl font-bold transition"
                    >
                      موافقة
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white px-6 py-2 rounded-xl font-bold transition"
                    >
                      رفض
                    </button>
                  </div>
                )}

                {filter === 'approved' && (
                  <span className="bg-green-500/20 text-green-300 px-4 py-2 rounded-xl font-bold self-start">
                    تمت الموافقة ✓
                  </span>
                )}

                {filter === 'rejected' && (
                  <span className="bg-red-500/20 text-red-300 px-4 py-2 rounded-xl font-bold self-start">
                    مرفوض ✗
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};