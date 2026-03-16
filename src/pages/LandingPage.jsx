import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GlassIcon } from '../components/common/GlassIcon';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { getCourses, getProfiles } from '../services/appwriteService';

export const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [courses, setCourses] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHelpMessage, setShowHelpMessage] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Load courses
    const fetchCourses = async () => {
      const response = await getCourses();
      if (response.success && response.data) {
        setCourses(response.data);
      }
    };
    fetchCourses();

    // Load top students for honor board
    const fetchTopStudents = async () => {
      try {
        const { success, data } = await getProfiles('student');
          
        if (success && data) {
          const students = data
            .map(s => ({
              ...s,
              points: calculatePoints(s)
            }))
            .sort((a, b) => b.points - a.points)
            .slice(0, 10);
          
          setTopStudents(students);
        }
      } catch (err) {
        console.error('Error fetching top students:', err);
      }
    };
    fetchTopStudents();

    // Show help message after 10 seconds
    const timer = setTimeout(() => setShowHelpMessage(true), 10000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const calculatePoints = (student) => {
    // This is a placeholder - implement your own point calculation logic
    return student.points || Math.floor(Math.random() * 200);
  };

  const getRankBadge = (points) => {
    if (points >= 150) return { text: 'أسطوري', class: 'bg-gradient-to-r from-yellow-500 to-amber-600' };
    if (points >= 100) return { text: 'متقدم', class: 'bg-gradient-to-r from-blue-500 to-cyan-600' };
    if (points >= 50) return { text: 'مجتهد', class: 'bg-gradient-to-r from-green-500 to-emerald-600' };
    return { text: 'مبتدئ', class: 'bg-gradient-to-r from-slate-500 to-zinc-600' };
  };

  const features = [
    {
      icon: 'brain',
      title: 'شرح يدخل المخ',
      desc: 'بنبسطلك المعلومة المعقدة ونخليها مية مية',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: 'target',
      title: 'حل كتير جداً',
      desc: 'بنحل معاك من كل المصادر والكتب الخارجية',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: 'message-circle',
      title: 'متابعة 24 ساعة',
      desc: 'اسأل في أي وقت هتلاقي اللي يرد عليك فوراً',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: 'award',
      title: 'نظام نقاط وتحفيز',
      desc: 'كل محاضرة تحضرها تكسب نقاط وتتصدر الترتيب',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: 'video',
      title: 'محاضرات مسجلة',
      desc: 'تقدر ترجع للمحاضرة أي وقت وتشوفها تاني',
      color: 'from-red-500 to-rose-500'
    },
    {
      icon: 'file-text',
      title: 'مذكرات وسبورات',
      desc: 'كل اللي يكتبه المستر على السبورة موجود PDF',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const stats = [
    { value: '5000+', label: 'طالب وطالبة', icon: 'users' },
    { value: '500+', label: 'محاضرة مسجلة', icon: 'video' },
    { value: '95%', label: 'نسبة النجاح', icon: 'trending-up' },
    { value: '24/7', label: 'دعم فني', icon: 'headphones' }
  ];

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${isDarkMode ? 'bg-brand-dark' : 'bg-slate-50'}`}>
      {/* Background grid pattern */}
      <div className="absolute inset-0 math-grid opacity-20 pointer-events-none"></div>
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      {/* Header */}
      <header className="relative z-50 p-4 md:p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-accent to-brand-primary rounded-xl flex items-center justify-center shadow-2xl">
            <span className="text-2xl font-black text-brand-dark">♞</span>
          </div>
          <h1 className={`text-xl md:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            سبيل <span className="text-brand-red">التفوق</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle isDark={isDarkMode} onToggle={setIsDarkMode} />
          
          {user ? (
            <button
              onClick={() => window.location.href = user?.role === 'admin' ? '/admin' : '/student'}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-bold transition flex items-center gap-2"
            >
              <GlassIcon name="arrow-left" size={18} />
              لوحة التحكم
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="btn-main px-6 py-2 rounded-full font-bold flex items-center gap-2"
            >
              <GlassIcon name="log-in" size={18} />
              تسجيل الدخول
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-12 md:py-20 flex flex-col-reverse md:flex-row items-center gap-8">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-right space-y-6">
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold border ${
            isDarkMode 
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
              : 'bg-purple-100 text-purple-700 border-purple-200'
          }`}>
            🎯 أقوى منصة لغة عربية في مصر
          </div>

          <h1 className={`text-4xl md:text-6xl font-black leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            اللغة العربية<br />
            <span className="bg-gradient-to-r from-brand-red to-brand-gold bg-clip-text text-transparent">
              سبيل التفوق!
            </span>
          </h1>

          <p className={`text-lg md:text-xl max-w-lg mx-auto md:mx-0 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            مع أستاذ <span className="font-bold text-brand-red">محمد حامد</span>.. النحو والبلاغة والأدب بقوا أسهل مما تتخيل.
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button
              onClick={() => setShowLoginModal(true)}
              className="btn-main px-8 py-4 rounded-xl text-lg font-bold flex items-center gap-2 group"
            >
              ابدأ رحلة التفوق
              <GlassIcon name="arrow-left" size={20} className="group-hover:translate-x-1 transition" />
            </button>
            
            <a
              href="#courses"
              className={`px-8 py-4 rounded-xl text-lg font-bold border-2 transition flex items-center gap-2 ${
                isDarkMode
                  ? 'border-white/10 hover:border-brand-accent text-white'
                  : 'border-slate-200 hover:border-brand-red text-slate-700'
              }`}
            >
              <GlassIcon name="book-open" size={20} />
              شوف الكورسات
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className={`text-2xl font-black ${isDarkMode ? 'text-brand-accent' : 'text-brand-red'}`}>
                  {stat.value}
                </div>
                <div className={`text-xs flex items-center gap-1 justify-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <GlassIcon name={stat.icon} size={12} />
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Image */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-red/30 to-brand-gold/30 blur-[80px] rounded-full"></div>
          <img
            src="https://via.placeholder.com/400x400?text=Teacher"
            alt="أستاذ محمد حامد"
            className="relative z-10 w-full max-w-md mx-auto animate-float drop-shadow-2xl"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400?text=Teacher';
            }}
         />
        </div>
      </section>

      {/* Features Section */}
      <section className={`relative py-20 ${isDarkMode ? 'bg-black/20' : 'bg-white/80'} backdrop-blur-sm`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl md:text-4xl font-black text-center mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            ليه تختار <span className="text-brand-red">سبيل التفوق</span>؟
          </h2>
          <p className={`text-center mb-12 max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            منصتنا مش مجرد شرح، دي تجربة متكاملة عشان الطالب يحقق أعلى الدرجات
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`glass-panel p-6 hover:scale-105 transition-all duration-300 group cursor-pointer ${
                  isDarkMode ? '' : 'bg-white'
                }`}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} p-4 mb-4 group-hover:rotate-6 transition`}>
                  <GlassIcon name={feature.icon} size={32} className="text-white" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="container mx-auto px-4 py-20">
        <h2 className={`text-3xl md:text-4xl font-black text-center mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          الكورسات <span className="text-brand-gold">المتاحة</span>
        </h2>
        <p className={`text-center mb-12 max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          اختر الباقة المناسبة لمستواك وابدأ رحلة التميز
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="glass-panel overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => {
                if (!user) {
                  setShowLoginModal(true);
                } else {
                  // Handle course selection
                }
              }}
            >
              <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-70" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <GlassIcon name="book-open" size={48} className="opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                
                {/* Grade badge */}
                <span className="absolute top-4 right-4 bg-brand-red/90 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {course.grade === '1sec' ? 'أولى ثانوي' : course.grade === '2sec' ? 'تانية ثانوي' : 'تالتة ثانوي'}
                </span>

                {/* Price tag */}
                <div className="absolute bottom-4 left-4 bg-brand-gold text-brand-dark px-4 py-2 rounded-xl font-black">
                  {course.price} <span className="text-xs">ج.م</span>
                </div>
              </div>

              <div className="p-6">
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {course.title}
                </h3>
                <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {course.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <GlassIcon name="clock" size={14} />
                    {course.duration} يوم
                  </span>
                  <button className="text-brand-red hover:text-brand-gold transition font-bold text-sm">
                    اشترك الآن ←
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Honor Board Section */}
      <section className={`py-20 ${isDarkMode ? 'bg-black/20' : 'bg-white/80'} backdrop-blur-sm`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl md:text-4xl font-black text-center mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            ♞ فرسان <span className="text-brand-gold">التفوق</span>
          </h2>
          <p className={`text-center mb-12 max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            أفضل 10 طلاب في المنصة بناءً على النقاط والحضور
          </p>

          <div className="max-w-3xl mx-auto">
            {topStudents.map((student, index) => {
              const rank = getRankBadge(student.points);
              return (
                <div
                  key={student.id}
                  className={`glass-panel p-4 mb-3 flex items-center gap-4 hover:scale-[1.02] transition ${
                    index === 0 ? 'border-2 border-yellow-500' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-slate-400 text-black' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-white/10'
                  }`}>
                    {index === 0 ? '👑' : index + 1}
                  </div>

                  {/* Photo */}
                  <img
                    src={student.photo || 'https://via.placeholder.com/50'}
                    className={`w-14 h-14 rounded-full object-cover ${
                      index === 0 ? 'border-4 border-yellow-500' : 'border-2 border-white/20'
                    }`}
                    alt={student.name}
                  />

                  {/* Info */}
                  <div className="flex-1">
                    <h4 className={`font-bold ${index === 0 ? 'text-yellow-300' : ''}`}>
                      {student.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${rank.class} text-white`}>
                        {rank.text}
                      </span>
                      <span className="text-xs text-slate-400">
                        {student.grade === '1sec' ? 'أولى ثانوي' : student.grade === '2sec' ? 'تانية ثانوي' : 'تالتة ثانوي'}
                      </span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-center">
                    <div className={`text-2xl font-black ${index === 0 ? 'text-yellow-400' : 'text-brand-accent'}`}>
                      {student.points}
                    </div>
                    <div className="text-xs text-slate-400">نقطة</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="glass-panel p-12 text-center bg-gradient-to-r from-brand-red/20 to-brand-gold/20">
          <h2 className={`text-3xl md:text-4xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            مستني إيه؟ <span className="text-brand-red">يلا بينا</span>
          </h2>
          <p className={`text-lg mb-8 max-w-2xl mx-auto ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            انضم لأكتر من 5000 طالب بدأوا رحلة التفوق في اللغة العربية
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="btn-main px-12 py-4 rounded-xl text-xl font-bold inline-flex items-center gap-3 group"
          >
            <GlassIcon name="log-in" size={24} />
            سجل دخولك دلوقتي
            <GlassIcon name="arrow-left" size={20} className="group-hover:translate-x-1 transition" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200'} py-8`}>
        <div className="container mx-auto px-4 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Developed with ❤️ by Marwan | جميع الحقوق محفوظة © 2025
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => setShowLoginModal(false)}>
          <div className="glass-panel p-8 max-w-md w-full animate-slide-up" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-full">
              <GlassIcon name="x" size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-red to-brand-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-white">♞</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">أهلاً بك في سبيل التفوق</h2>
              <p className="text-slate-400">سجل دخولك وابدأ رحلة التعلم</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  window.location.href = '/login';
                }}
                className="w-full bg-brand-primary text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-brand-primary/90 transition"
              >
                <GlassIcon name="log-in" size={20} />
                الانتقال لتسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Message */}
      {showHelpMessage && !user && (
        <div
          onClick={() => setShowLoginModal(true)}
          className="fixed bottom-8 left-8 glass-panel p-4 border-r-4 border-brand-red cursor-pointer animate-slide-up hover:scale-105 transition z-50"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-red/20 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-2xl">♞</span>
            </div>
            <div>
              <h4 className="font-bold text-white">محتاج مساعدة؟</h4>
              <p className="text-sm text-slate-400">اضغط هنا للبدء</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};