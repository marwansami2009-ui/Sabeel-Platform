import React, { useState, useEffect } from 'react';
import { GlassIcon } from '../common/GlassIcon';
import { generateCenterCodes, getCenterCodesList } from '../../services/appwriteService';

export const CenterCodes = ({ courses }) => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [codeCount, setCodeCount] = useState(10);
  const [expiryDays, setExpiryDays] = useState(30);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const { success, data } = await getCenterCodesList();
          
        if (success && data) {
          const formattedCodes = data.map(item => ({
            code: item.code,
            courseName: item.courses?.title || 'غير معروف',
            courseId: item.course_id,
            isUsed: item.is_used,
            usedBy: item.used_by,
            createdAt: new Date(item.created_at).getTime(),
            expiryDate: new Date(item.expiry_date).getTime()
          }));
          setCodes(formattedCodes);
        } else {
          setCodes([]);
        }
      } catch (err) {
        console.error(err);
        setCodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCodes();
  }, []);

  const handleGenerate = async () => {
    if (!selectedCourse) {
      alert('الرجاء اختيار كورس');
      return;
    }

    const course = courses.find(c => c.id === selectedCourse);
    
    setGenerating(true);
    await generateCenterCodes(codeCount, selectedCourse, course.title, expiryDays);
    setGenerating(false);
    setShowGenerator(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('تم نسخ الكود');
  };

  const copyAllCodes = () => {
    const codesList = codes
      .filter(c => !c.isUsed)
      .map(c => c.code)
      .join('\n');
    
    if (codesList) {
      navigator.clipboard.writeText(codesList);
      alert('تم نسخ جميع الأكواد غير المستخدمة');
    }
  };

  const getStatusBadge = (code) => {
    if (code.isUsed) {
      return <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">مستخدم</span>;
    }
    
    if (code.expiryDate < Date.now()) {
      return <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs">منتهي</span>;
    }
    
    return <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">صالح</span>;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <GlassIcon name="gift" size={24} /> أكواد السنتر
        </h2>

        <div className="flex gap-2">
          <button
            onClick={copyAllCodes}
            className="bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white px-6 py-2 rounded-xl font-bold transition"
          >
            نسخ جميع الأكواد
          </button>
          <button
            onClick={() => setShowGenerator(true)}
            className="btn-main px-6 py-2 rounded-xl font-bold"
          >
            توليد أكواد جديدة
          </button>
        </div>
      </div>

      {showGenerator && (
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold mb-4">توليد أكواد جديدة</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">اختر الكورس</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <option value="">-- اختر كورس --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} - {course.grade === '1sec' ? 'أولى' : course.grade === '2sec' ? 'تانية' : 'تالتة'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">عدد الأكواد</label>
                <input
                  type="number"
                  value={codeCount}
                  onChange={(e) => setCodeCount(parseInt(e.target.value) || 1)}
                  min="1"
                  max="100"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">صلاحية (أيام)</label>
                <input
                  type="number"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value) || 1)}
                  min="1"
                  max="365"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGenerator(false)}
                className="flex-1 py-4 bg-white/10 rounded-xl font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 btn-main py-4 rounded-xl font-bold disabled:opacity-50"
              >
                {generating ? 'جاري التوليد...' : 'توليد الأكواد'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <GlassIcon name="loader" size={32} className="mx-auto mb-4 animate-spin" />
          <p>جاري التحميل...</p>
        </div>
      ) : codes.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <GlassIcon name="gift" size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-slate-400">لا توجد أكواد بعد</h3>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-4">الكود</th>
                  <th className="p-4">الكورس</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">تاريخ الإنشاء</th>
                  <th className="p-4">تاريخ الصلاحية</th>
                  <th className="p-4">المستخدم</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr key={code.code} className="border-t border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg">{code.code}</span>
                        <button
                          onClick={() => copyToClipboard(code.code)}
                          className="text-brand-accent hover:bg-white/10 p-1 rounded"
                        >
                          <GlassIcon name="copy" size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="font-bold">{code.courseName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(code)}
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(code.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(code.expiryDate).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4 text-sm">
                      {code.usedBy ? (
                        <span className="text-slate-400">{code.usedBy}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};