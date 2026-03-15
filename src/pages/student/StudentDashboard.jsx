import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GlassIcon } from '../../components/common/GlassIcon';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { CoursePurchaseModal } from '../../components/payment/CoursePurchaseModal';
import { LecturePlayer } from '../../components/lectures/LecturePlayer';
import { supabase } from '../../supabaseClient';
import { validateCenterCode, useCenterCode, getCourses, getLectures } from '../../services/supabaseService';

export const StudentDashboard = () => {
  const { user, userData, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [exams, setExams] = useState([]);
  const [whiteboards, setWhiteboards] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [centerCode, setCenterCode] = useState('');
  const [codeValidating, setCodeValidating] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Get user's enrolled courses
  const enrolledCourses = userData?.enrolledCourses || [];
  
  // Filter courses that user is enrolled in
  const myCourses = courses.filter(c => enrolledCourses.includes(c.id));
  
  // Available courses for purchase
  const availableCourses = courses.filter(c => !enrolledCourses.includes(c.id));

  // Filter lectures based on enrolled courses
  const availableLectures = lectures.filter(lec => 
    lec.isFree || enrolledCourses.includes(lec.courseId)
  );

  useEffect(() => {
    document.body.classList.toggle('light-mode', !isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesRes = await getCourses();
        if (coursesRes.success && coursesRes.data) {
          setCourses(coursesRes.data);
        }

        const lecturesRes = await getLectures();
        if (lecturesRes.success && lecturesRes.data) {
          setLectures(lecturesRes.data);
        }

        const { data: examsData } = await supabase.from('exams').select('*');
        if (examsData) setExams(examsData);

        const { data: whiteboardsData } = await supabase.from('whiteboards').select('*');
        if (whiteboardsData) setWhiteboards(whiteboardsData);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();

    return () => {
      // Cleanup if using realtime subscriptions later
    };
  }, []);

  const calculateStats = () => {
    const totalLectures = availableLectures.length;
    const watchedLectures = userData?.watchedLectures?.length || 0;
    const attendanceRate = userData?.attendanceRate || 0;
    const points = userData?.points || 0;

    return {
      totalLectures,
      watchedLectures,
      progress: totalLectures > 0 ? Math.round((watchedLectures / totalLectures) * 100) : 0,
      attendanceRate,
      points
    };
  };

  const stats = calculateStats();

  const handleCodeSubmit = async () => {
    if (!centerCode.trim()) {
      setCodeError('الرجاء إدخال الكود');
      return;
    }

    setCodeValidating(true);
    setCodeError('');
    setCodeSuccess('');

    const result = await validateCenterCode(centerCode.toUpperCase());
    
    if (!result.valid) {
      setCodeError(result.message);
      setCodeValidating(false);
      return;
    }

    // Use the code
    const useResult = await useCenterCode(centerCode.toUpperCase(), user.uid || user.id);
    
    if (useResult.success) {
      setCodeSuccess(`تم تفعيل كورس ${useResult.courseName} بنجاح!`);
      setCenterCode('');
      setTimeout(() => {
        setShowCodeModal(false);
        setCodeSuccess('');
      }, 3000);
    } else {
      setCodeError(useResult.message);
    }

    setCodeValidating(false);
  };

  const getRankBadge = (points) => {
    if (points >= 150) return { text: 'أسطوري', class: 'bg-gradient-to-r from-yellow-500 to-amber-600' };
    if (points >= 100) return { text: 'متقدم', class: 'bg-gradient-to-r from-blue-500 to-cyan-600' };
    if (points >= 50) return { text: 'مجتهد', class: 'bg-gradient-to-r from-green-500 to-emerald-600' };
    return { text: 'مبتدئ', class: 'bg-gradient-to-r from-slate-500 to-zinc-600' };
  };

  const rank = getRankBadge(stats.points);

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: 'home' },
    { id: 'mycourses', label: 'كورساتي', icon: 'book-open', count: myCourses.length },
    { id: 'lectures', label: 'المحاضرات', icon: 'video', count: availableLectures.length },
    { id: 'exams', label: 'الامتحانات', icon: 'clipboard-list' },
    { id: 'whiteboards', label: 'السبورات', icon: 'file-text' },
    { id: 'store', label: 'متجر الكورسات', icon: 'shopping-cart', count: availableCourses.length }
  ];

  if (userData?.status === 'pending') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-brand-dark' : 'bg-slate-50'}`}>
        <div className="glass-panel p-8 max-w-md w-full text-center animate-scale-in">
          <div className="absolute top-4 left-4">
            <ThemeToggle isDark={isDarkMode} onToggle={setIsDarkMode} />
          </div>

          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <GlassIcon name="clock" size={40} className="text-yellow-500" />
          </div>
          
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            حسابك قيد التفعيل ⏳
          </h2>
          
          <p className={`mb-8 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            أهلاً بك يا بطل! تم استلام بياناتك بنجاح.
            <br />
            الإدارة تقوم بمراجعة حسابك حالياً، يرجى الانتظار لحين التفعيل.
          </p>

          <button
            onClick={logout}
            className="w-full bg-white/10 hover:bg-white/20 text-brand-red p-4 rounded-xl font-bold flex items-center justify-center gap-3 transition"
          >
            <GlassIcon name="log-out" size={20} />
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${isDarkMode ? 'bg-brand-dark text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      } md:translate-x-0 md:static flex flex-col ${
        isDarkMode ? 'bg-brand-card' : 'bg-white'
      } border-l border-white/5`}>
        
        {/* User Profile */}
        <div className="p-6 text-center border-b border-white/5">
          <div className="relative inline-block">
            <img
              src={user?.photoURL || 'https://via.placeholder.com/100'}
              className="w-24 h-24 rounded-full border-4 border-brand-red mx-auto mb-3"
              alt={userData?.name}
            />
            <div className={`absolute bottom-2 right-0 w-5 h-5 rounded-full border-2 ${
              userData?.isActive ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
          </div>

          <h3 className="font-bold text-lg">{userData?.name}</h3>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {userData?.grade === '1sec' ? 'الصف الأول الثانوي' :
             userData?.grade === '2sec' ? 'الصف الثاني الثانوي' : 'الصف الثالث الثانوي'}
          </p>
          
          <div className="mt-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${rank.class}`}>
              {rank.text}
            </span>
          </div>

          <div className="mt-3 flex justify-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
              🏆 {stats.points} نقطة
            </span>
            <span className={`px-2 py-1 rounded ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
              📊 {stats.progress}%
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
                setSelectedLecture(null);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-bold ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-brand-red to-brand-gold text-white'
                  : isDarkMode
                    ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <GlassIcon name={item.icon} size={18} />
              <span className="flex-1 text-right">{item.label}</span>
              {item.count > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeTab === item.id
                    ? 'bg-white/20 text-white'
                    : isDarkMode ? 'bg-white/10' : 'bg-slate-200'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={() => setShowCodeModal(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
          >
            <GlassIcon name="gift" size={18} />
            لدي كود سنتر
          </button>

          <div className="flex items-center justify-between p-2">
            <ThemeToggle isDark={isDarkMode} onToggle={setIsDarkMode} />
            <button
              onClick={logout}
              className="text-red-400 hover:text-red-300 p-2 rounded-lg transition"
            >
              <GlassIcon name="log-out" size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden p-4 flex justify-between items-center sticky top-0 z-40 bg-brand-dark/80 backdrop-blur-md border-b border-white/5">
          <h1 className="font-black text-xl text-brand-red">سبيل التفوق</h1>
          <button onClick={() => setSidebarOpen(true)}>
            <GlassIcon name="menu" size={24} />
          </button>
        </header>

        {/* Content Area */}
        <main className="p-4 md:p-8 max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="glass-panel p-8 bg-gradient-to-r from-brand-red/20 to-brand-gold/20">
                <h1 className="text-3xl font-black mb-2">
                  مرحباً {userData?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-slate-400 mb-4">
                  عندك {myCourses.length} كورس مفعل و{availableLectures.length} محاضرة متاحة
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setActiveTab('mycourses')}
                    className="btn-main px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                  >
                    <GlassIcon name="book-open" size={18} />
                    كورساتي المفعلة
                  </button>
                  <button
                    onClick={() => setActiveTab('store')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                  >
                    <GlassIcon name="shopping-cart" size={18} />
                    اشتر كورس جديد
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <GlassIcon name="book-open" size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{myCourses.length}</div>
                      <div className="text-xs text-slate-400">كورسات مفعلة</div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <GlassIcon name="video" size={20} className="text-green-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{availableLectures.length}</div>
                      <div className="text-xs text-slate-400">محاضرة متاحة</div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <GlassIcon name="trending-up" size={20} className="text-purple-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.progress}%</div>
                      <div className="text-xs text-slate-400">تقدم المشاهدة</div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <GlassIcon name="award" size={20} className="text-yellow-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.points}</div>
                      <div className="text-xs text-slate-400">نقاط التميز</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="glass-panel p-6">
                <h3 className="font-bold mb-4">📊 تقدمك العام</h3>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-red to-brand-gold transition-all duration-500"
                    style={{ width: `${stats.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-slate-400">
                  <span>شاهدت {stats.watchedLectures} من {stats.totalLectures} محاضرة</span>
                  <span>{stats.progress}%</span>
                </div>
              </div>

              {/* My Courses Preview */}
              {myCourses.length > 0 && (
                <div className="glass-panel p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">📚 أحدث كورساتك</h3>
                    <button
                      onClick={() => setActiveTab('mycourses')}
                      className="text-brand-red hover:text-brand-gold text-sm font-bold"
                    >
                      عرض الكل ←
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {myCourses.slice(0, 2).map((course) => (
                      <div
                        key={course.id}
                        className="bg-white/5 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition"
                        onClick={() => {
                          setSelectedCourse(course);
                          setActiveTab('lectures');
                        }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-red to-brand-gold flex items-center justify-center">
                          <GlassIcon name="book-open" size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{course.title}</h4>
                          <p className="text-xs text-slate-400">{course.duration} يوم</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mycourses' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">📚 كورساتي المفعلة</h2>
              
              {myCourses.length === 0 ? (
                <div className="glass-panel p-12 text-center">
                  <GlassIcon name="book-open" size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold mb-2">لا توجد كورسات مفعلة</h3>
                  <p className="text-slate-400 mb-6">اشترك في كورس جديد وابدأ رحلة التعلم</p>
                  <button
                    onClick={() => setActiveTab('store')}
                    className="btn-main px-8 py-3 rounded-xl font-bold"
                  >
                    تصفح الكورسات
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCourses.map((course) => (
                    <div
                      key={course.id}
                      className="glass-panel overflow-hidden group cursor-pointer"
                      onClick={() => {
                        setSelectedCourse(course);
                        setActiveTab('lectures');
                      }}
                    >
                      <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-4 right-4">
                          <h3 className="font-bold text-lg">{course.title}</h3>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{course.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                            مفعل ✓
                          </span>
                          <button className="text-brand-red hover:text-brand-gold text-sm font-bold">
                            عرض المحاضرات ←
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'lectures' && (
            <div className="space-y-6">
              {selectedLecture ? (
                <div>
                  <button
                    onClick={() => setSelectedLecture(null)}
                    className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white font-bold"
                  >
                    <GlassIcon name="arrow-right" size={18} />
                    العودة للمحاضرات
                  </button>
                  <LecturePlayer
                    lecture={selectedLecture}
                    userEnrolledCourses={enrolledCourses}
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">🎥 المحاضرات</h2>
                  
                  {availableLectures.length === 0 ? (
                    <div className="glass-panel p-12 text-center">
                      <GlassIcon name="video-off" size={48} className="mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-bold mb-2">لا توجد محاضرات متاحة</h3>
                      <p className="text-slate-400">اشترك في كورس أولاً لمشاهدة المحاضرات</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availableLectures.map((lecture) => (
                        <div
                          key={lecture.id}
                          onClick={() => setSelectedLecture(lecture)}
                          className="glass-panel overflow-hidden cursor-pointer group hover:border-brand-red/50 transition"
                        >
                          <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition"></div>
                            <GlassIcon
                              name="play-circle"
                              size={48}
                              className="text-white opacity-70 group-hover:opacity-100 group-hover:scale-110 transition"
                            />
                            {lecture.isFree && (
                              <span className="absolute top-4 right-4 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                                مجاني
                              </span>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold mb-2">{lecture.title}</h3>
                            <p className="text-xs text-slate-400 line-clamp-2">{lecture.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'store' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">🛒 متجر الكورسات</h2>
              
              {availableCourses.length === 0 ? (
                <div className="glass-panel p-12 text-center">
                  <GlassIcon name="check-circle" size={48} className="mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl font-bold mb-2">أنت مشترك في جميع الكورسات!</h3>
                  <p className="text-slate-400">مبروك 🎉 أنت مشترك في كل الكورسات المتاحة</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableCourses.map((course) => (
                    <div
                      key={course.id}
                      className="glass-panel overflow-hidden group cursor-pointer hover:scale-105 transition"
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowPurchaseModal(true);
                      }}
                    >
                      <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <span className="absolute top-4 right-4 bg-brand-red/90 text-white px-2 py-1 rounded text-xs font-bold">
                          {course.grade === '1sec' ? 'أولى ثانوي' : course.grade === '2sec' ? 'تانية ثانوي' : 'تالتة ثانوي'}
                        </span>
                        <div className="absolute bottom-4 left-4 bg-brand-gold text-brand-dark px-3 py-1 rounded-xl font-black">
                          {course.price} ج.م
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{course.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs flex items-center gap-1 text-slate-400">
                            <GlassIcon name="clock" size={12} />
                            {course.duration} يوم
                          </span>
                          <button className="text-brand-red hover:text-brand-gold text-sm font-bold">
                            اشترك الآن ←
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Center Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setShowCodeModal(false)}>
          <div className="glass-panel p-8 max-w-md w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowCodeModal(false)} className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-full">
              <GlassIcon name="x" size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <GlassIcon name="gift" size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">أدخل كود السنتر</h3>
              <p className="text-slate-400 text-sm mt-2">إذا كان لديك كود خصم من السنتر، أدخله هنا</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={centerCode}
                onChange={(e) => setCenterCode(e.target.value.toUpperCase())}
                placeholder="مثال: C123ABC456"
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-center text-2xl tracking-widest text-white"
                maxLength={12}
                autoFocus
              />

              {codeError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-400 text-sm text-center">{codeError}</p>
                </div>
              )}

              {codeSuccess && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                  <p className="text-green-400 text-sm text-center">{codeSuccess}</p>
                </div>
              )}

              <button
                onClick={handleCodeSubmit}
                disabled={codeValidating}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold disabled:opacity-50"
              >
                {codeValidating ? 'جاري التحقق...' : 'تفعيل الكود'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && selectedCourse && (
        <CoursePurchaseModal
          course={selectedCourse}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedCourse(null);
          }}
          user={user}
          userData={userData}
          onSuccess={() => {
            setShowPurchaseModal(false);
            setSelectedCourse(null);
            // Refresh data
          }}
        />
      )}
    </div>
  );
};