import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GlassIcon } from '../../components/common/GlassIcon';

export const CompleteProfile = ({ onComplete }) => {
  const { user, saveUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    fatherName: '',
    grandfatherName: '',
    phone: '',
    parentPhone: '',
    school: '',
    governorate: '',
    city: '',
    grade: '1sec',
    bio: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validate Arabic only for name fields
    if (['firstName', 'fatherName', 'grandfatherName'].includes(name)) {
      if (/^[\u0600-\u06FF\s]*$/.test(value) || value === '') {
        setFormData({ ...formData, [name]: value });
      }
    } 
    // Validate numbers only for phone fields
    else if (['phone', 'parentPhone'].includes(name)) {
      if (/^\d*$/.test(value) && value.length <= 11) {
        setFormData({ ...formData, [name]: value });
      }
    }
    // Other fields
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.fatherName || !formData.grandfatherName) {
      setError('⚠️ يجب كتابة الاسم الثلاثي بالكامل');
      return false;
    }

    if (formData.phone.length !== 11) {
      setError('⚠️ رقم الهاتف يجب أن يكون 11 رقم');
      return false;
    }

    if (formData.parentPhone.length !== 11) {
      setError('⚠️ رقم ولي الأمر يجب أن يكون 11 رقم');
      return false;
    }

    if (!formData.school || !formData.governorate || !formData.city) {
      setError('⚠️ من فضلك أكمل جميع بيانات العنوان والمدرسة');
      return false;
    }

    // Bio is now optional
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    const displayName = `${formData.firstName} ${formData.fatherName} ${formData.grandfatherName}`.trim();
    
    const userData = {
      name: displayName,
      displayName,
      email: user.email,
      photo: user.photoURL || 'https://via.placeholder.com/150',
      phone: formData.phone || user.user_metadata?.phone,
      enrolledCourses: [],
      role: 'student',
      isProfileComplete: true
    };

    const result = await saveUserData(user.uid, userData);
    
    if (result.success) {
      onComplete();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4 py-8">
      <div className="glass-panel p-8 w-full max-w-2xl animate-slide-up">
        <div className="text-center mb-8">
          <img 
            src={user?.photoURL || 'https://via.placeholder.com/150'} 
            className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-brand-accent" 
            alt="User" 
          />
          <h2 className="text-3xl font-bold text-white mb-2">أهلاً بك يا بطل! 👋</h2>
          <p className="text-slate-400">استكمل بياناتك بدقة عشان حسابك يشتغل</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name fields */}
          <div className="glass-panel p-4 border border-white/10">
            <h4 className="text-sm font-bold text-brand-accent mb-3 flex items-center gap-2">
              <GlassIcon name="user" size={16} /> الاسم الثلاثي (باللغة العربية)
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="الاسم الأول"
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white text-center"
                required
              />
              <input
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                placeholder="اسم الأب"
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white text-center"
                required
              />
              <input
                name="grandfatherName"
                value={formData.grandfatherName}
                onChange={handleInputChange}
                placeholder="اسم الجد"
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white text-center"
                required
              />
            </div>
          </div>

          {/* Phone numbers */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="رقم تليفونك (11 رقم)"
              maxLength="11"
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white"
              required
            />
            <input
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleInputChange}
              placeholder="رقم ولي الأمر (11 رقم)"
              maxLength="11"
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white"
              required
            />
          </div>

          {/* School */}
          <input
            name="school"
            value={formData.school}
            onChange={handleInputChange}
            placeholder="اسم المدرسة 🏫"
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white"
            required
          />

          {/* Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="governorate"
              value={formData.governorate}
              onChange={handleInputChange}
              placeholder="المحافظة 🗺️"
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white"
              required
            />
            <input
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="المدينة 📍"
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white"
              required
            />
          </div>

          {/* Grade */}
          <select
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white"
            required
          >
            <option value="1sec">الصف الأول الثانوي</option>
            <option value="2sec">الصف الثاني الثانوي</option>
            <option value="3sec">الصف الثالث الثانوي</option>
          </select>

          {/* Bio */}
          <div className="glass-panel p-4 border border-blue-500/20">
            <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
              <GlassIcon name="edit-3" size={16} /> نبذة عنك (اختياري)
            </h4>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="اكتب وصف لنفسك... من أنت؟ وما هو هدفك؟"
              className="w-full p-4 bg-white/5 border border-blue-500/20 rounded-xl text-white h-24 resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-main w-full py-4 rounded-xl text-lg font-bold disabled:opacity-50"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ البيانات والمتابعة'}
          </button>
        </form>
      </div>
    </div>
  );
};