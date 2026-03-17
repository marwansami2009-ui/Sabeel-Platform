import React, { useState, useEffect } from 'react';
import { GlassIcon } from '../common/GlassIcon';
import { generatePackageCode, getCenterCodesList, generateStudentCenterCode } from '../../services/appwriteService';

export const CenterCodes = ({ courses }) => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showStudentGenerator, setShowStudentGenerator] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [usageLimit, setUsageLimit] = useState(1);
  const [expiryDays, setExpiryDays] = useState(30);
  const [codeLabel, setCodeLabel] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [generating, setGenerating] = useState(false);

  const refreshCodes = async () => {
    try {
      const { success, data } = await getCenterCodesList();
      if (success && data) {
        const formattedCodes = data.map(item => ({
          code: item.code,
          courseName: item.student_phone
            ? `تسجيل دخول: ${item.student_name}`
            : (item.label || item.courses?.title || 'باقة'),
          courseId: item.course_id,
          isUsed: item.is_used,
          usedBy: item.used_by,
          usageLimit: item.usageLimit || 1,
          currentUsage: item.currentUsage || 0,
          createdAt: item.$createdAt ? new Date(item.$createdAt).getTime() : Date.now(),
          expiryDate: item.expiryDate ? new Date(item.expiryDate).getTime() : null,
          studentPhone: item.student_phone
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

  useEffect(() => { refreshCodes(); }, []);

  const handleGenerate = async () => {
    if (selectedCourses.length === 0) {
      alert('الرجاء اختيار كورس واحد على الأقل');
      return;
    }

    setGenerating(true);
    await generatePackageCode({
      courseIds: selectedCourses,
      usageLimit,
      expiryDays,
      label: codeLabel
    });
    setGenerating(false);
    setShowGenerator(false);
    setSelectedCourses([]);
    setCodeLabel('');
    await refreshCodes();
  };

  const handleGenerateStudentCode = async () => {
    if (!studentName || !studentPhone) {
      alert('الرجاء إدخال اسم الطالب ورقم الهاتف');
      return;
    }

    setGenerating(true);
    await generateStudentCenterCode(studentName, studentPhone);
    setGenerating(false);
    setShowStudentGenerator(false);
    setStudentName('');
    setStudentPhone('');
    await refreshCodes();
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('تم نسخ الكود');
  };

  const copyAllCodes = () => {
    const codesList = codes
      .filter(c => !c.isUsed && c.currentUsage < c.usageLimit)
      .map(c => c.code)
      .join('\n');
    
    if (codesList) {
      navigator.clipboard.writeText(codesList);
      alert('تم نسخ جميع الأكواد الصالحة');
    }
  };

  const getStatusBadge = (code) => {
    if (code.currentUsage >= code.usageLimit) {
      return <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">مكتمل الاستخدام</span>;
    }
    
    if (code.expiryDate && code.expiryDate < Date.now()) {
      return <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs">منتهي</span>;
    }
    
    return <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">صالح</span>;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <GlassIcon name="gift" size={24} /> أكواد الباقات
        </h2>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={copyAllCodes}
            className="bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white px-4 py-2 rounded-xl font-bold transition text-sm"
          >
            نسخ الأكواد الصالحة
          </button>
          <button
            onClick={() => { setShowStudentGenerator(true); setShowGenerator(false); }}
            className="bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-white px-4 py-2 rounded-xl font-bold transition text-sm"
          >
            كود تسجيل دخول طالب
          </button>
          <button
            onClick={() => { setShowGenerator(true); setShowStudentGenerator(false); }}
            className="btn-main px-4 py-2 rounded-xl font-bold text-sm"
          >
            + توليد كود باقة
          </button>
        </div>
      </div>

      {/* Package Code Generator */}
      {showGenerator && (
        <div className="glass-panel p-6 animate-scale-in">
          <h3 className="text-xl font-bold mb-4">📦 توليد كود باقة جديد</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">اسم الباقة (اختياري)</label>
              <input
                type="text"
                value={codeLabel}
                onChange={(e) => setCodeLabel(e.target.value)}
                placeholder="مثال: باقة الشهر - أولى ثانوي"
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-3">اختر الكورسات (يمكن اختيار أكثر من كورس)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => toggleCourseSelection(course.id)}
                    className={`p-3 rounded-xl text-sm font-bold text-right transition border ${
                      selectedCourses.includes(course.id)
                        ? 'bg-brand-gold/20 border-brand-gold text-brand-gold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {course.title}
                    <span className="block text-xs mt-1 opacity-60">
                      {course.grade === '1sec' ? 'أولى' : course.grade === '2sec' ? 'تانية' : 'تالتة'}
                    </span>
                  </button>
                ))}
              </div>
              {selectedCourses.length > 0 && (
                <p className="text-xs text-brand-gold mt-2">✓ {selectedCourses.length} كورس محدد</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">حد الاستخدام</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(parseInt(e.target.value) || 1)}
                  min="1"
                  max="1000"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl"
                />
                <p className="text-xs text-slate-500 mt-1">عدد الطلاب اللي يقدروا يستخدموا الكود</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">صلاحية (أيام)</label>
                <input
                  type="number"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value) || 1)}
                  min="1"
                  max="365"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGenerator(false)}
                className="flex-1 py-3 bg-white/10 rounded-xl font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 btn-main py-3 rounded-xl font-bold disabled:opacity-50"
              >
                {generating ? 'جاري التوليد...' : 'توليد الكود'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Login Code Generator */}
      {showStudentGenerator && (
        <div className="glass-panel p-6 animate-scale-in">
          <h3 className="text-xl font-bold mb-4 text-orange-400">توليد كود تسجيل دخول لطالب</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">اسم الطالب</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="محمد أحمد"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStudentGenerator(false)}
                className="flex-1 py-3 bg-white/10 rounded-xl font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleGenerateStudentCode}
                disabled={generating}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold disabled:opacity-50"
              >
                {generating ? 'جاري التوليد...' : 'توليد الكود'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Codes Table */}
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
                  <th className="p-4">الباقة / الكورس</th>
                  <th className="p-4">الاستخدام</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">الصلاحية</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr key={code.code} className="border-t border-white/5 hover:bg-white/5 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm">{code.code}</span>
                        <button
                          onClick={() => copyToClipboard(code.code)}
                          className="text-brand-accent hover:bg-white/10 p-1 rounded"
                        >
                          <GlassIcon name="copy" size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-sm">{code.courseName}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-white/10 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-brand-gold rounded-full transition-all"
                            style={{ width: `${Math.min((code.currentUsage / code.usageLimit) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          {code.currentUsage}/{code.usageLimit}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(code)}
                    </td>
                    <td className="p-4 text-sm">
                      {code.expiryDate
                        ? new Date(code.expiryDate).toLocaleDateString('ar-EG')
                        : <span className="text-slate-500">مفتوح</span>
                      }
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