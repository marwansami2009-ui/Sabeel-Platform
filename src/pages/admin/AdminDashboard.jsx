// AdminDashboard.jsx - مع إضافة Quiz Builder
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GlassIcon } from '../../components/common/GlassIcon';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { PaymentRequests } from '../../components/admin/PaymentRequests';
import { CenterCodes } from '../../components/admin/CenterCodes';
import { QuizManagement } from '../../components/admin/QuizManagement';
import { QuizBuilder } from '../../components/admin/QuizBuilder';
import {
  getCourses,
  createCourse,
  deleteCourse,
  getLectures,
  createLecture,
  updateLecture,
  deleteLecture,
  getPaymentRequests,
  getProfiles,
  getPendingStudents,
  updateProfileStatus,
  enrollInCourse,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getAllQuizzes
} from '../../services/appwriteService';

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
  const [quizzes, setQuizzes] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddLecture, setShowAddLecture] = useState(false);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [selectedCourseForQuiz, setSelectedCourseForQuiz] = useState(null);
  const [editingLecture, setEditingLecture] = useState(null);
  const [showEditLecture, setShowEditLecture] = useState(false);
  
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: 0,
    duration_days: 30,
    grade: '1sec',
    image_url: '',
    is_published: true
  });
  
  const defaultLectureState = {
    title: '',
    youtube_url: '',
    description: '',
    course_id: '',
    duration_minutes: 0,
    is_free: false,
    order_index: 0,
    external_link: '',
    quiz_id: '',
    summary_url: '',
    homework_url: ''
  };
  const [newLecture, setNewLecture] = useState(defaultLectureState);
  const [isEditingLecture, setIsEditingLecture] = useState(false);

  const isSuperAdmin = profile?.role === 'boss';

  if (!user || (!profile && !loading)) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    document.body.classList.toggle('light-mode', !isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const coursesResult = await getCourses();
    if (coursesResult.success) setCourses(coursesResult.data);

    const lecturesResult = await getLectures();
    if (lecturesResult.success) setLectures(lecturesResult.data);

    const paymentsResult = await getPaymentRequests();
    if (paymentsResult.success) setPaymentRequests(paymentsResult.data);

    const studentsResult = await getProfiles('student');
    if (studentsResult.success) setStudents(studentsResult.data);
    
    const pendingResult = await getPendingStudents();
    if(pendingResult.success) setPendingStudents(pendingResult.data);

    const quizzesResult = await getAllQuizzes();
    if (quizzesResult.success) setQuizzes(quizzesResult.data);

    const announcementsResult = await getAnnouncements();
    if (announcementsResult.success) setAnnouncements(announcementsResult.data);

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
      loadData();
    } else {
      alert('حدث خطأ: ' + result.error);
    }
  };

  const handleAddLecture = async () => {
    if (!newLecture.title || !newLecture.youtube_url || !newLecture.course_id) {
      alert('يا وحش املأ العناوين ورابط يوتيوب واختر الكورس الأول!');
      return;
    }

    setLoading(true);
    const result = await createLecture(newLecture);
    
    if (result.success) {
      setShowAddLecture(false);
      setNewLecture({
        title: '', youtube_url: '', description: '', course_id: '',
        duration_minutes: 0, is_free: false, order_index: 0,
        summary_url: '', homework_url: '', external_link: '', quiz_id: ''
      });
      await loadData();
      alert('✅ المحاضرة نزلت بنجاح!');
    } else {
      alert('❌ حدث خطأ: ' + result.error);
    }
    setLoading(false);
  };

  const handleOpenEditLecture = (lecture) => {
    setEditingLecture({
      id: lecture.id,
      title: lecture.title || '',
      youtube_url: lecture.youtube_url || '',
      description: lecture.description || '',
      course_id: lecture.course_id || '',
      duration_minutes: lecture.duration_minutes || 0,
      is_free: lecture.is_free || false,
      order_index: lecture.order_index || 0,
      external_link: lecture.external_link || '',
      quiz_id: lecture.quiz_id || '',
      summary_url: lecture.summary_url || '',
      homework_url: lecture.homework_url || ''
    });
    setShowEditLecture(true);
  };

  const handleUpdateLecture = async () => {
    if (!editingLecture) return;
    const { id, ...data } = editingLecture;
    const result = await updateLecture(id, data);
    if (result.success) {
      setShowEditLecture(false);
      setEditingLecture(null);
      loadData();
      alert('✅ تم تحديث المحاضرة بنجاح');
    } else {
      alert('حدث خطأ: ' + result.error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (confirm('هل أنت متأكد من حذف هذا الكورس؟')) {
      const result = await deleteCourse(courseId);
      if (result.success) loadData();
      else alert('حدث خطأ: ' + result.error);
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    if (confirm('هل أنت متأكد من حذف هذه المحاضرة؟')) {
      const result = await deleteLecture(lectureId);
      if (result.success) loadData();
      else alert('حدث خطأ: ' + result.error);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert('الرجاء كتابة العنوان والمحتوى');
      return;
    }
    const result = await createAnnouncement(newAnnouncement);
    if (result.success) {
      setNewAnnouncement({ title: '', content: '' });
      loadData();
    } else {
      alert('حدث خطأ أثناء إضافة الإعلان');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (confirm('هل ترغب حقاً في حذف هذا الإعلان؟')) {
      const result = await deleteAnnouncement(id);
      if (result.success) loadData();
    }
  };

  const handleStudentApproval = async (studentId, status) => {
    let confirmMsg = status === 'active' ? 'هل أنت متأكد من قبول هذا الطالب؟' : 'هل أنت متأكد من رفض هذا الطالب؟';
    if(confirm(confirmMsg)) {
        const result = await updateProfileStatus(studentId, status);
        if(result.success) loadData();
        else alert('حدث خطأ: ' + result.error);
    }
  };

  const stats = {
    students: students.length,
    pendingStudents: pendingStudents.length,
    courses: courses.length,
    lectures: lectures.length,
    quizzes: quizzes.length,
    pendingPayments: paymentRequests.filter(r => r.status === 'pending').length
  };

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: 'home' },
    { id: 'payments', label: 'طلبات الدفع', icon: 'credit-card', badge: stats.pendingPayments },
    { id: 'codes', label: 'أكواد السنتر', icon: 'gift' },
    { id: 'courses', label: 'الكورسات', icon: 'book-open', count: courses.length },
    { id: 'lectures', label: 'المحاضرات', icon: 'video', count: lectures.length },
    { id: 'quizzes', label: 'الامتحانات', icon: 'edit-3', count: quizzes.length },
    { id: 'students', label: 'إدارة الطلاب', icon: 'users', count: students.length + pendingStudents.length },
    { id: 'announcements', label: 'الإعلانات', icon: 'bell' }
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
        <header className="md:hidden p-4 flex justify-between items-center sticky top-0 z-40 bg-brand-dark/80 backdrop-blur-md border-b border-white/5">
          <h1 className="font-black text-xl text-brand-red">لوحة التحكم</h1>
          <button onClick={() => setSidebarOpen(true)}>
            <GlassIcon name="menu" size={24} />
          </button>
        </header>

        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="glass-panel p-8 bg-gradient-to-r from-brand-red/20 to-brand-gold/20">
                <h1 className="text-3xl font-black mb-2">
                  مرحباً {profile?.firstName || 'مدير'} 👋
                </h1>
                <p className="text-slate-400">
                  عندك {stats.pendingPayments} طلب دفع pending و{students.length} طالب مسجل
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                      <GlassIcon name="edit-3" size={20} className="text-yellow-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.quizzes}</div>
                      <div className="text-xs text-slate-400">امتحانات</div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <GlassIcon name="credit-card" size={20} className="text-red-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                      <div className="text-xs text-slate-400">طلبات معلقة</div>
                    </div>
                  </div>
                </div>
              </div>

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
                    onClick={() => {
                      setActiveTab('courses');
                    }}
                    className="bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white p-4 rounded-xl font-bold transition text-center"
                  >
                    <GlassIcon name="edit-3" size={24} className="mx-auto mb-2" />
                    إنشاء امتحان
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && <PaymentRequests onUpdate={loadData} />}
          
          {activeTab === 'codes' && <CenterCodes courses={courses} />}

          {activeTab === 'quizzes' && <QuizManagement />}

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
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedCourseForQuiz(course);
                              setShowQuizBuilder(true);
                            }}
                            className="text-purple-400 hover:text-purple-300 p-2 rounded-lg transition"
                            title="إضافة امتحان"
                          >
                            <GlassIcon name="edit-3" size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg transition"
                          >
                            <GlassIcon name="trash-2" size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'lectures' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🎥 إدارة المحاضرات</h2>
                <button
                  onClick={() => {
                    setIsEditingLecture(false);
                    setNewLecture(defaultLectureState);
                    setShowAddLecture(true);
                  }}
                  className="btn-main px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                >
                  <GlassIcon name="plus" size={18} />
                  إضافة محاضرة
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lectures.map((lecture) => (
                  <div key={lecture.id} className="glass-panel overflow-hidden group">
                    <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center">
                      <GlassIcon name="video" size={48} className="opacity-30" />
                      {lecture.is_free && (
                        <span className="absolute top-4 right-4 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                          مجاني
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold mb-2">{lecture.title}</h3>
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{lecture.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-slate-400">
                          {lecture.courses?.title || 'بدون كورس'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEditLecture(lecture)}
                            className="text-blue-400 hover:text-blue-300 p-2 rounded-lg transition"
                            title="تعديل المحاضرة"
                          >
                            <GlassIcon name="edit" size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteLecture(lecture.id)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg transition"
                          >
                            <GlassIcon name="trash-2" size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <GlassIcon name="users" size={24} />
                إدارة الطلاب
              </h2>

              {pendingStudents.length > 0 && (
                <div className="glass-panel p-6 border-2 border-brand-red">
                  <h3 className="font-bold text-brand-red mb-4 text-lg">
                    الطلاب المعلقين (قيد المراجعة) ({pendingStudents.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="border-b border-white/10">
                        <tr>
                          <th className="pb-3 text-slate-400">الاسم</th>
                          <th className="pb-3 text-slate-400">رقم الهاتف</th>
                          <th className="pb-3 text-slate-400">الصف الدراسي</th>
                          <th className="pb-3 text-slate-400 text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingStudents.map(student => (
                          <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition">
                            <td className="py-4 font-bold">{student.firstName} {student.lastName}</td>
                            <td className="py-4">{student.phone}</td>
                            <td className="py-4">
                              <span className="bg-brand-red/20 text-brand-red px-3 py-1 rounded-full text-xs font-bold">
                                {student.grade === '1sec' ? 'أولى ثانوي' : student.grade === '2sec' ? 'تانية ثانوي' : 'تالتة ثانوي'}
                              </span>
                            </td>
                            <td className="py-4 text-center">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleStudentApproval(student.id, 'active')}
                                  className="bg-green-500/20 text-green-400 px-4 py-1.5 rounded-lg hover:bg-green-500 hover:text-white transition font-bold text-sm"
                                >
                                  قبول
                                </button>
                                <button
                                  onClick={() => handleStudentApproval(student.id, 'rejected')}
                                  className="bg-red-500/20 text-red-500 px-4 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition font-bold text-sm"
                                >
                                  رفض
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="glass-panel p-6">
                <h3 className="font-bold mb-4 text-lg">الطلاب النشطين ({students.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="border-b border-white/10">
                      <tr>
                        <th className="pb-3 text-slate-400">الاسم</th>
                        <th className="pb-3 text-slate-400">رقم الهاتف</th>
                        <th className="pb-3 text-slate-400">الصف الدراسي</th>
                        <th className="pb-3 text-slate-400 text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="py-4 font-bold">{student.firstName} {student.lastName}</td>
                          <td className="py-4">{student.phone}</td>
                          <td className="py-4">
                            <span className="bg-white/10 text-slate-300 px-3 py-1 rounded-full text-xs font-bold">
                              {student.grade === '1sec' ? 'أولى ثانوي' : student.grade === '2sec' ? 'تانية ثانوي' : 'تالتة ثانوي'}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">نشط ✓</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <GlassIcon name="bell" size={24} />
                إدارة الإعلانات
              </h2>
              
              <div className="glass-panel p-6 border-2 border-brand-red/30 bg-gradient-to-b from-brand-red/10 to-transparent">
                <h3 className="font-bold text-lg mb-4">إضافة إعلان جديد</h3>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <input
                    type="text"
                    placeholder="عنوان الإعلان"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:border-brand-gold outline-none"
                    required
                  />
                  <textarea
                    placeholder="محتوى الإعلان..."
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:border-brand-gold outline-none h-32"
                    required
                  ></textarea>
                  <button type="submit" className="btn-main px-8 py-3 rounded-xl font-bold hover:scale-105 transition">
                    إرسال الإعلان للجميع
                  </button>
                </form>
              </div>

              <div className="space-y-4 mt-8">
                <h3 className="font-bold text-lg">الإعلانات السابقة ({announcements.length})</h3>
                {announcements.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">لا توجد إعلانات حالياً</p>
                ) : (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="glass-panel p-6 relative">
                      <button 
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="absolute top-4 left-4 text-red-400 hover:text-red-300 bg-red-400/10 p-2 rounded-lg transition"
                      >
                        <GlassIcon name="trash-2" size={18} />
                      </button>
                      <h4 className="font-bold text-xl text-brand-gold mb-2">{announcement.title}</h4>
                      <p className="text-slate-300 leading-relaxed max-w-[90%]">{announcement.content}</p>
                      <p className="text-xs text-slate-500 mt-4 text-left">
                        {new Date(announcement.$createdAt || announcement.created_at).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setShowAddCourse(false)}>
          <div className="glass-panel p-8 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">إضافة كورس جديد</h3>

            <div className="space-y-4">
              <input
                placeholder="عنوان الكورس"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
              />
              
              <textarea
                placeholder="وصف الكورس"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl h-24"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="السعر"
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({ ...newCourse, price: parseInt(e.target.value) })}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl"
                />
                
                <input
                  type="number"
                  placeholder="المدة (يوم)"
                  value={newCourse.duration_days}
                  onChange={(e) => setNewCourse({ ...newCourse, duration_days: parseInt(e.target.value) })}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl"
                />
              </div>

              <select
                value={newCourse.grade}
                onChange={(e) => setNewCourse({ ...newCourse, grade: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <option value="1sec">أولى ثانوي</option>
                <option value="2sec">تانية ثانوي</option>
                <option value="3sec">تالتة ثانوي</option>
              </select>

              <input
                placeholder="رابط الصورة"
                value={newCourse.image_url}
                onChange={(e) => setNewCourse({ ...newCourse, image_url: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newCourse.is_published}
                  onChange={(e) => setNewCourse({ ...newCourse, is_published: e.target.checked })}
                />
                منشور
              </label>

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

      {showAddLecture && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowAddLecture(false)}>
          <div className="glass-panel p-8 max-w-2xl w-full my-8" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">{isEditingLecture ? 'تعديل المحاضرة' : 'إضافة محاضرة جديدة'}</h3>

            <div className="space-y-4">
              <input
                placeholder="عنوان المحاضرة"
                value={newLecture.title}
                onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
              />

              <input
                placeholder="رابط يوتيوب"
                value={newLecture.youtube_url}
                onChange={(e) => setNewLecture({ ...newLecture, youtube_url: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
              />

              <textarea
                placeholder="وصف المحاضرة"
                value={newLecture.description}
                onChange={(e) => setNewLecture({ ...newLecture, description: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl h-24"
              />

              <select
                value={newLecture.course_id}
                onChange={(e) => setNewLecture({ ...newLecture, course_id: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <option value="">-- اختر كورس --</option>
                {courses?.length > 0 && courses.map((course) => (
                  <option key={course.$id || course.id} value={course.$id || course.id}>
                    {course.title}
                  </option>
                ))}
              </select>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="المدة (دقيقة)"
                  value={newLecture.duration_minutes}
                  onChange={(e) => setNewLecture({ ...newLecture, duration_minutes: parseInt(e.target.value) })}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl"
                />
                
                <input
                  type="number"
                  placeholder="الترتيب"
                  value={newLecture.order_index}
                  onChange={(e) => setNewLecture({ ...newLecture, order_index: parseInt(e.target.value) })}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  placeholder="رابط ملخص الدرس (صورة)"
                  value={newLecture.summary_url || ''}
                  onChange={(e) => setNewLecture({ ...newLecture, summary_url: e.target.value })}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                />
                
                <input
                  placeholder="رابط خارجي (اختياري)"
                  value={newLecture.external_link || ''}
                  onChange={(e) => setNewLecture({ ...newLecture, external_link: e.target.value })}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  placeholder="رابط الواجب الخارجي"
                  value={newLecture.homework_url || ''}
                  onChange={(e) => setNewLecture({ ...newLecture, homework_url: e.target.value })}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                />

                <select
                  value={newLecture.quiz_id || ''}
                  onChange={(e) => setNewLecture({ ...newLecture, quiz_id: e.target.value })}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
                >
                  <option value="">-- أو اختر اختبار للمنصة --</option>
                  {quizzes?.length > 0 && quizzes.map((quiz) => (
                    <option key={quiz.$id || quiz.id} value={quiz.$id || quiz.id}>
                      {quiz.title}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newLecture.is_free}
                  onChange={(e) => setNewLecture({ ...newLecture, is_free: e.target.checked })}
                />
                محاضرة مجانية
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddLecture(false)}
                  className="flex-1 py-4 bg-white/10 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveLecture}
                  className="flex-1 btn-main py-4 rounded-xl font-bold"
                >
                  {isEditingLecture ? 'حفظ التعديلات' : 'إضافة المحاضرة'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lecture Modal */}
      {showEditLecture && editingLecture && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setShowEditLecture(false)}>
          <div className="glass-panel p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">✏️ تعديل المحاضرة</h3>

            <div className="space-y-4">
              <input
                placeholder="عنوان المحاضرة"
                value={editingLecture.title}
                onChange={(e) => setEditingLecture({ ...editingLecture, title: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
              />

              <input
                placeholder="رابط يوتيوب"
                value={editingLecture.youtube_url}
                onChange={(e) => setEditingLecture({ ...editingLecture, youtube_url: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
              />

              <textarea
                placeholder="وصف المحاضرة"
                value={editingLecture.description}
                onChange={(e) => setEditingLecture({ ...editingLecture, description: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl h-24"
              />

              <select
                value={editingLecture.course_id}
                onChange={(e) => setEditingLecture({ ...editingLecture, course_id: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <option value="">-- اختر كورس --</option>
                {courses?.length > 0 && courses.map((course) => (
                  <option key={course.$id || course.id} value={course.$id || course.id}>
                    {course.title}
                  </option>
                ))}
              </select>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="المدة (دقيقة)"
                  value={editingLecture.duration_minutes}
                  onChange={(e) => setEditingLecture({ ...editingLecture, duration_minutes: parseInt(e.target.value) })}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl"
                />
                <input
                  type="number"
                  placeholder="الترتيب"
                  value={editingLecture.order_index}
                  onChange={(e) => setEditingLecture({ ...editingLecture, order_index: parseInt(e.target.value) })}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl"
                />
              </div>

              <input
                placeholder="رابط خارجي (اختياري)"
                value={editingLecture.external_link}
                onChange={(e) => setEditingLecture({ ...editingLecture, external_link: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
              />

              <input
                placeholder="رابط ملخص الدرس - صورة imgBB (اختياري)"
                value={editingLecture.summary_url}
                onChange={(e) => setEditingLecture({ ...editingLecture, summary_url: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
              />

              <input
                placeholder="رابط الواجب / بابل شيت (اختياري)"
                value={editingLecture.homework_url}
                onChange={(e) => setEditingLecture({ ...editingLecture, homework_url: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
              />

              <select
                value={editingLecture.quiz_id}
                onChange={(e) => setEditingLecture({ ...editingLecture, quiz_id: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <option value="">-- بدون امتحان --</option>
                {quizzes?.length > 0 && quizzes.map((quiz) => (
                  <option key={quiz.$id || quiz.id} value={quiz.$id || quiz.id}>
                    {quiz.title}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingLecture.is_free}
                  onChange={(e) => setEditingLecture({ ...editingLecture, is_free: e.target.checked })}
                />
                محاضرة مجانية
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditLecture(false)}
                  className="flex-1 py-4 bg-white/10 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleUpdateLecture}
                  className="flex-1 btn-main py-4 rounded-xl font-bold"
                >
                  💾 حفظ التعديلات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Builder Modal */}
      {showQuizBuilder && selectedCourseForQuiz && (
        <QuizBuilder
          courseId={selectedCourseForQuiz.id}
          onClose={() => {
            setShowQuizBuilder(false);
            setSelectedCourseForQuiz(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;