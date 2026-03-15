import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GlassIcon } from '../../components/common/GlassIcon';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { PaymentRequests } from '../../components/admin/PaymentRequests';
import { CenterCodes } from '../../components/admin/CenterCodes';
import {
  getCourses,
  createCourse,
  deleteCourse,
  getLectures,
  createLecture,
  deleteLecture,
  getPaymentRequests,
  getProfiles,
  getPendingStudents,
  updateProfileStatus
} from '../../services/supabaseService';

export const AdminDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [students, setStudents] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddLecture, setShowAddLecture] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: 0,
    duration_days: 30,
    grade: '1sec',
    image_url: '',
    is_published: true
  });
  const [newLecture, setNewLecture] = useState({
    title: '',
    youtube_url: '',
    description: '',
    course_id: '',
    duration_minutes: 0,
    is_free: false,
    order_index: 0
  });

  const isSuperAdmin = profile?.role === 'boss';

  useEffect(() => {
    document.body.classList.toggle('light-mode', !isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load courses
    const coursesResult = await getCourses();
    if (coursesResult.success) {
      setCourses(coursesResult.data);
    }

    // Load lectures
    const lecturesResult = await getLectures();
    if (lecturesResult.success) {
      setLectures(lecturesResult.data);
    }

    // Load payment requests
    const paymentsResult = await getPaymentRequests();
    if (paymentsResult.success) {
      setPaymentRequests(paymentsResult.data);
    }

    // Load students
    const studentsResult = await getProfiles('student');
    if (studentsResult.success) {
      setStudents(studentsResult.data);
    }
    
    // Load pending students
    const pendingResult = await getPendingStudents();
    if(pendingResult.success) {
        setPendingStudents(pendingResult.data);
    }

    setLoading(false);
  };

  const handleAddCourse = async () => {
    if (!newCourse.title || !newCourse.price) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    const result = await createCourse(newCourse);
    
    if (result.success) {
      setShowAddCourse(false);
      setNewCourse({
        title: '',
        description: '',
        price: 0,
        duration_days: 30,
        grade: '1sec',
        image_url: '',
        is_published: true
      });
      loadData(); // Refresh data
    } else {
      alert('حدث خطأ: ' + result.error);
    }
  };

  const handleAddLecture = async () => {
    if (!newLecture.title || !newLecture.youtube_url || !newLecture.course_id) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    // Extract YouTube ID from URL
    const youtubeId = extractYouTubeId(newLecture.youtube_url);
    if (!youtubeId) {
      alert('رابط يوتيوب غير صالح');
      return;
    }

    const lectureData = {
      ...newLecture,
      youtube_id: youtubeId
    };

    const result = await createLecture(lectureData);
    
    if (result.success) {
      setShowAddLecture(false);
      setNewLecture({
        title: '',
        youtube_url: '',
        description: '',
        course_id: '',
        duration_minutes: 0,
        is_free: false,
        order_index: 0
      });
      loadData();
    } else {
      alert('حدث خطأ: ' + result.error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (confirm('هل أنت متأكد من حذف هذا الكورس؟')) {
      const result = await deleteCourse(courseId);
      if (result.success) {
        loadData();
      } else {
        alert('حدث خطأ: ' + result.error);
      }
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    if (confirm('هل أنت متأكد من حذف هذه المحاضرة؟')) {
      const result = await deleteLecture(lectureId);
      if (result.success) {
        loadData();
      } else {
        alert('حدث خطأ: ' + result.error);
      }
    }
  };

  const handleStudentApproval = async (studentId, status) => {
    let confirmMsg = status === 'active' ? 'هل أنت متأكد من قبول هذا الطالب؟' : 'هل أنت متأكد من رفض وتجميد هذا الطالب؟';
    if(confirm(confirmMsg)) {
        const result = await updateProfileStatus(studentId, status);
        if(result.success) {
            loadData();
        } else {
            alert('حدث خطأ: ' + result.error);
        }
    }
  }

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const stats = {
    students: students.length,
    pendingStudents: pendingStudents.length,
    courses: courses.length,
    lectures: lectures.length,
    pendingPayments: paymentRequests.filter(r => r.status === 'pending').length
  };

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: 'home' },
    { id: 'payments', label: 'طلبات الدفع', icon: 'credit-card', badge: stats.pendingPayments },
    { id: 'codes', label: 'أكواد السنتر', icon: 'gift' },
    { id: 'courses', label: 'الكورسات', icon: 'book-open', count: courses.length },
    { id: 'lectures', label: 'المحاضرات', icon: 'video', count: lectures.length },
    { id: 'students', label: 'الطلاب النشطين', icon: 'users', count: students.length },
    { id: 'pending-students', label: 'طلبات الانضمام', icon: 'user-plus', badge: stats.pendingStudents }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-accent">جاري التحميل...</p>
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
        
        {/* Admin Profile */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-red to-brand-gold rounded-xl flex items-center justify-center">
              <span className="text-2xl font-black text-white">⚡</span>
            </div>
            <div>
              <h1 className="font-black">لوحة التحكم</h1>
              <p className="text-xs text-slate-400">{profile?.email}</p>
            </div>
          </div>

          {isSuperAdmin && (
            <div className="bg-yellow-500/20 text-yellow-300 px-3 py-2 rounded-lg text-xs font-bold text-center">
              👑 المدير الأعلى
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
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
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between p-2">
            <ThemeToggle isDark={isDarkMode} onToggle={setIsDarkMode} />
            <button
              onClick={signOut}
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
          <h1 className="font-black text-xl text-brand-red">لوحة التحكم</h1>
          <button onClick={() => setSidebarOpen(true)}>
            <GlassIcon name="menu" size={24} />
          </button>
        </header>

        {/* Content Area */}
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="glass-panel p-8 bg-gradient-to-r from-brand-red/20 to-brand-gold/20">
                <h1 className="text-3xl font-black mb-2">
                  مرحباً {profile?.name} 👋
                </h1>
                <p className="text-slate-400">
                  عندك {stats.pendingPayments} طلب دفع pending و{students.length} طالب مسجل
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <GlassIcon name="users" size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.students}</div>
                      <div className="text-xs text-slate-400">طلاب</div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <GlassIcon name="book-open" size={20} className="text-green-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.courses}</div>
                      <div className="text-xs text-slate-400">كورسات</div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <GlassIcon name="video" size={20} className="text-purple-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.lectures}</div>
                      <div className="text-xs text-slate-400">محاضرات</div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <GlassIcon name="credit-card" size={20} className="text-yellow-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                      <div className="text-xs text-slate-400">طلبات معلقة</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-panel p-6">
                <h3 className="font-bold mb-4">⚡ إجراءات سريعة</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setShowAddCourse(true)}
                    className="bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white p-4 rounded-xl font-bold transition text-center"
                  >
                    <GlassIcon name="plus-circle" size={24} className="mx-auto mb-2" />
                    إضافة كورس جديد
                  </button>

                  <button
                    onClick={() => setShowAddLecture(true)}
                    className="bg-green-500/20 hover:bg-green-500 text-green-300 hover:text-white p-4 rounded-xl font-bold transition text-center"
                  >
                    <GlassIcon name="video" size={24} className="mx-auto mb-2" />
                    رفع محاضرة جديدة
                  </button>

                  <button
                    onClick={() => setActiveTab('codes')}
                    className="bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white p-4 rounded-xl font-bold transition text-center"
                  >
                    <GlassIcon name="gift" size={24} className="mx-auto mb-2" />
                    توليد أكواد سنتر
                  </button>
                </div>
              </div>

              {/* Recent Payment Requests */}
              <div className="glass-panel p-6">
                <h3 className="font-bold mb-4">🕒 أحدث طلبات الدفع</h3>
                <div className="space-y-3">
                  {paymentRequests.slice(0, 5).map((req) => (
                    <div key={req.id} className="bg-white/5 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="font-bold">{req.profiles?.name}</span>
                        <span className="text-sm text-slate-400 mr-2">طلب كورس {req.courses?.title}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        req.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {req.status === 'pending' ? 'معلق' :
                         req.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && <PaymentRequests onUpdate={loadData} />}
          
          {activeTab === 'codes' && <CenterCodes courses={courses} />}

          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">📚 إدارة الكورسات</h2>
                <button
                  onClick={() => setShowAddCourse(true)}
                  className="btn-main px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                >
                  <GlassIcon name="plus" size={18} />
                  إضافة كورس
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="glass-panel overflow-hidden group">
                    <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 relative">
                      {course.image_url ? (
                        <img 
                          src={course.image_url} 
                          alt={course.title}
                          className="w-full h-full object-cover opacity-70"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <GlassIcon name="book-open" size={40} className="opacity-30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-4 right-4">
                        <h3 className="font-bold text-lg">{course.title}</h3>
                      </div>
                      <span className="absolute top-4 left-4 bg-brand-red/90 text-white px-2 py-1 rounded text-xs font-bold">
                        {course.price} ج.م
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-slate-400 line-clamp-2 mb-3">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {course.grade === '1sec' ? 'أولى ثانوي' : course.grade === '2sec' ? 'تانية ثانوي' : 'تالتة ثانوي'}
                        </span>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg transition"
                        >
                          <GlassIcon name="trash-2" size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'lectures' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">🎥 إدارة المحاضرات</h2>
                <button
                  onClick={() => setShowAddLecture(true)}
                  className="btn-main px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                >
                  <GlassIcon name="plus" size={18} />
                  إضافة محاضرة
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lectures.map((lecture) => {
                  const course = courses.find(c => c.id === lecture.course_id);
                  return (
                    <div key={lecture.id} className="glass-panel overflow-hidden group">
                      <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center">
                        <img 
                          src={`https://img.youtube.com/vi/${lecture.youtube_id}/mqdefault.jpg`}
                          alt={lecture.title}
                          className="w-full h-full object-cover opacity-70"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/320x180?text=Video';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <GlassIcon name="play-circle" size={40} className="text-white opacity-70" />
                        </div>
                        {lecture.is_free && (
                          <span className="absolute top-4 right-4 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                            مجاني
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold mb-2">{lecture.title}</h3>
                        <p className="text-xs text-slate-400 mb-2 line-clamp-2">{lecture.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-white/10 px-2 py-1 rounded">
                            {course?.title || 'غير معروف'}
                          </span>
                          <button
                            onClick={() => handleDeleteLecture(lecture.id)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg transition"
                          >
                            <GlassIcon name="trash-2" size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">👥 الطلاب المسجلين</h2>

              <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="p-4">الطالب</th>
                        <th className="p-4">الصف</th>
                        <th className="p-4">المحافظة</th>
                        <th className="p-4">الهاتف</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-t border-white/5 hover:bg-white/5">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={student.avatar_url || 'https://via.placeholder.com/40'}
                                className="w-10 h-10 rounded-full"
                                alt={student.name}
                              />
                              <div>
                                <p className="font-bold">{student.name}</p>
                                <p className="text-xs text-slate-400">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {student.grade === '1sec' ? 'أولى ثانوي' :
                             student.grade === '2sec' ? 'تانية ثانوي' : 'تالتة ثانوي'}
                          </td>
                          <td className="p-4">{student.governorate || '-'}</td>
                          <td className="p-4">{student.phone}</td>
                          <td className="p-4">
                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                              نشط
                            </span>
                          </td>
                          <td className="p-4">
                              <button
                                onClick={() => handleStudentApproval(student.id, 'rejected')}
                                className="bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white px-3 py-1 rounded-lg text-sm transition"
                              >
                                حظر
                              </button>
                          </td>
                        </tr>
                      ))}
                      {students.length === 0 && (
                          <tr><td colSpan="6" className="p-4 text-center text-slate-400">لا يوجد طلاب نشطين حالياً</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pending-students' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">👤 طلبات الانضمام (قيد الانتظار)</h2>

              <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="p-4">الطالب</th>
                        <th className="p-4">الصف</th>
                        <th className="p-4">المحافظة</th>
                        <th className="p-4">الهاتف</th>
                        <th className="p-4 flex gap-2 justify-end">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingStudents.map((student) => (
                        <tr key={student.id} className="border-t border-white/5 hover:bg-white/5">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={student.avatar_url || 'https://via.placeholder.com/40'}
                                className="w-10 h-10 rounded-full"
                                alt={student.name}
                              />
                              <div>
                                <p className="font-bold">{student.name}</p>
                                <p className="text-xs text-slate-400">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {student.grade === '1sec' ? 'أولى ثانوي' :
                             student.grade === '2sec' ? 'تانية ثانوي' : 'تالتة ثانوي'}
                          </td>
                          <td className="p-4">{student.governorate || '-'}</td>
                          <td className="p-4">{student.phone}</td>
                          <td className="p-4 flex justify-end gap-2">
                             <button
                                onClick={() => handleStudentApproval(student.id, 'active')}
                                className="bg-green-500/20 text-green-300 hover:bg-green-500 hover:text-white px-3 py-1 rounded-lg text-sm transition flex items-center gap-1"
                              >
                                <GlassIcon name="check" size={14} /> قبول
                              </button>
                              <button
                                onClick={() => handleStudentApproval(student.id, 'rejected')}
                                className="bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white px-3 py-1 rounded-lg text-sm transition flex items-center gap-1"
                              >
                                <GlassIcon name="x" size={14} /> رفض
                              </button>
                          </td>
                        </tr>
                      ))}
                      {pendingStudents.length === 0 && (
                          <tr><td colSpan="5" className="p-4 text-center text-slate-400">لا يوجد طلبات انضمام جديدة</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setShowAddCourse(false)}>
          <div className="glass-panel p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">إضافة كورس جديد</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">عنوان الكورس</label>
                <input
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                  placeholder="مثال: النحو والصرف للأول الثانوي"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">الوصف</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl h-24"
                  placeholder="وصف مختصر للكورس"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">السعر (جنيه)</label>
                  <input
                    type="number"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({ ...newCourse, price: parseInt(e.target.value) })}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">المدة (أيام)</label>
                  <input
                    type="number"
                    value={newCourse.duration_days}
                    onChange={(e) => setNewCourse({ ...newCourse, duration_days: parseInt(e.target.value) })}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">الصف</label>
                <select
                  value={newCourse.grade}
                  onChange={(e) => setNewCourse({ ...newCourse, grade: e.target.value })}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                >
                  <option value="1sec">الصف الأول الثانوي</option>
                  <option value="2sec">الصف الثاني الثانوي</option>
                  <option value="3sec">الصف الثالث الثانوي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">صورة الكورس (رابط)</label>
                <input
                  value={newCourse.image_url}
                  onChange={(e) => setNewCourse({ ...newCourse, image_url: e.target.value })}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddCourse(false)}
                  className="flex-1 py-4 bg-white/10 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddCourse}
                  className="flex-1 btn-main py-4 rounded-xl font-bold"
                >
                  إضافة الكورس
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lecture Modal */}
      {showAddLecture && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setShowAddLecture(false)}>
          <div className="glass-panel p-8 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">إضافة محاضرة جديدة</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">عنوان المحاضرة</label>
                <input
                  value={newLecture.title}
                  onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                  placeholder="مثال: شرح درس الميزان الصرفي"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">رابط يوتيوب</label>
                <input
                  value={newLecture.youtube_url}
                  onChange={(e) => setNewLecture({ ...newLecture, youtube_url: e.target.value })}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-slate-400 mt-1">يدعم الروابط العادية وروابط unlisted</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">الوصف</label>
                <textarea
                  value={newLecture.description}
                  onChange={(e) => setNewLecture({ ...newLecture, description: e.target.value })}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl h-24"
                  placeholder="وصف مختصر للمحاضرة"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">الكورس</label>
                  <select
                    value={newLecture.course_id}
                    onChange={(e) => setNewLecture({ ...newLecture, course_id: e.target.value })}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                  >
                    <option value="">-- اختر كورس --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">المدة (دقيقة)</label>
                  <input
                    type="number"
                    value={newLecture.duration_minutes}
                    onChange={(e) => setNewLecture({ ...newLecture, duration_minutes: parseInt(e.target.value) })}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">الترتيب</label>
                <input
                  type="number"
                  value={newLecture.order_index}
                  onChange={(e) => setNewLecture({ ...newLecture, order_index: parseInt(e.target.value) })}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_free"
                  checked={newLecture.is_free}
                  onChange={(e) => setNewLecture({ ...newLecture, is_free: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="is_free">محاضرة مجانية (الكل يشوفها)</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddLecture(false)}
                  className="flex-1 py-4 bg-white/10 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddLecture}
                  className="flex-1 btn-main py-4 rounded-xl font-bold"
                >
                  إضافة المحاضرة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};