import { databases } from '../appwriteConfig';
import { ID, Query } from 'appwrite';

// التحقق من المتغيرات البيئية
const requiredEnvVars = {
  VITE_APPWRITE_DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  VITE_APPWRITE_PROFILES_COLLECTION_ID: import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID,
  VITE_APPWRITE_COURSES_COLLECTION_ID: import.meta.env.VITE_APPWRITE_COURSES_COLLECTION_ID,
  VITE_APPWRITE_LECTURES_COLLECTION_ID: import.meta.env.VITE_APPWRITE_LECTURES_COLLECTION_ID,
  VITE_APPWRITE_ENROLLMENTS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_ENROLLMENTS_COLLECTION_ID,
  VITE_APPWRITE_PAYMENT_REQUESTS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_PAYMENT_REQUESTS_COLLECTION_ID,
  VITE_APPWRITE_CENTER_CODES_COLLECTION_ID: import.meta.env.VITE_APPWRITE_CENTER_CODES_COLLECTION_ID,
  VITE_APPWRITE_QUIZZES_COLLECTION_ID: import.meta.env.VITE_APPWRITE_QUIZZES_COLLECTION_ID,
  VITE_APPWRITE_QUIZ_QUESTIONS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_QUIZ_QUESTIONS_COLLECTION_ID,
  VITE_APPWRITE_WRONG_ANSWERS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_WRONG_ANSWERS_COLLECTION_ID,
  VITE_APPWRITE_ANNOUNCEMENTS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_ANNOUNCEMENTS_COLLECTION_ID,
  VITE_APPWRITE_ASSIGNMENTS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_ASSIGNMENTS_COLLECTION_ID,
};

// تحذير إذا كان أي متغير مفقود
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.warn(`⚠️ Missing env var: ${key} - بعض الوظائف قد لا تعمل`);
  }
});

export const APPWRITE_DATABASE_ID = requiredEnvVars.VITE_APPWRITE_DATABASE_ID;
export const PROFILES_COLLECTION_ID = requiredEnvVars.VITE_APPWRITE_PROFILES_COLLECTION_ID;
export const COURSES_COLLECTION_ID = requiredEnvVars.VITE_APPWRITE_COURSES_COLLECTION_ID;
export const LECTURES_COLLECTION_ID = requiredEnvVars.VITE_APPWRITE_LECTURES_COLLECTION_ID;
export const ENROLLMENTS_COLLECTION_ID = requiredEnvVars.VITE_APPWRITE_ENROLLMENTS_COLLECTION_ID;
export const PAYMENT_REQUESTS_COLLECTION_ID = requiredEnvVars.VITE_APPWRITE_PAYMENT_REQUESTS_COLLECTION_ID;
export const CENTER_CODES_COLLECTION_ID = requiredEnvVars.VITE_APPWRITE_CENTER_CODES_COLLECTION_ID;
export const QUIZZES_COLLECTION_ID = requiredEnvVars.VITE_APPWRITE_QUIZZES_COLLECTION_ID;
export const QUIZ_QUESTIONS_COLLECTION_ID = requiredEnvVars.VITE_APPWRITE_QUIZ_QUESTIONS_COLLECTION_ID;
export const WRONG_ANSWERS_COLLECTION_ID = requiredEnvVars.VITE_APPWRITE_WRONG_ANSWERS_COLLECTION_ID;
export const ANNOUNCEMENTS_COLLECTION_ID = requiredEnvVars.VITE_APPWRITE_ANNOUNCEMENTS_COLLECTION_ID;
export const ASSIGNMENTS_COLLECTION_ID = requiredEnvVars.VITE_APPWRITE_ASSIGNMENTS_COLLECTION_ID;

// Helper functions للتعامل الآمن مع Appwrite
const safeDbCall = async (dbCall, fallbackData = null) => {
  try {
    if (!APPWRITE_DATABASE_ID) {
      console.error('❌ Database ID is missing');
      return fallbackData;
    }
    return await dbCall();
  } catch (error) {
    console.error('Database error:', error);
    return fallbackData;
  }
};

// Helper for mapping Appwrite $id to id 
const mapDoc = (doc) => {
  if (!doc) return null;
  return { ...doc, id: doc.$id };
};

// ========== SMART URL EXTRACTOR ==========
export const extractDirectImageUrl = (input) => {
  if (!input || typeof input !== 'string') return '';

  const trimmed = input.trim();
  if (!trimmed) return '';

  // 1. Already a clean direct image URL
  if (/^https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?[^\s]*)?$/i.test(trimmed)) {
    return trimmed;
  }

  // 2. Full HTML embed block
  if (trimmed.includes('<')) {
    const imgSrcAll = [...trimmed.matchAll(/<img[^>]+src\s*=\s*["']([^"']+)["']/gi)];
    if (imgSrcAll.length > 0) {
      const directImg = imgSrcAll.find(m => /\.(jpg|jpeg|png|gif|webp|avif)/i.test(m[1]));
      if (directImg) return directImg[1];
      return imgSrcAll[0][1];
    }

    const hrefMatch = trimmed.match(/<a[^>]+href\s*=\s*["']([^"']+\.(jpg|jpeg|png|gif|webp|avif)[^"']*)["']/i);
    if (hrefMatch && hrefMatch[1]) return hrefMatch[1];
  }

  // 3. BBCode [img]...[/img]
  const bbcodeMatch = trimmed.match(/\[img\](.*?)\[\/img\]/i);
  if (bbcodeMatch && bbcodeMatch[1]) return bbcodeMatch[1].trim();

  // 4. PostImg viewer link → direct
  const postimgViewer = trimmed.match(/^https?:\/\/(?:www\.)?postimg\.cc\/([a-zA-Z0-9]+)/i);
  if (postimgViewer) return `https://i.postimg.cc/${postimgViewer[1]}/image.jpg`;

  // 5. ImgBB viewer link → direct
  const imgbbViewer = trimmed.match(/^https?:\/\/(?:www\.)?ibb\.co\/([a-zA-Z0-9]+)/i);
  if (imgbbViewer) return `https://i.ibb.co/${imgbbViewer[1]}/image.jpg`;

  // 6. Imgur viewer → direct
  const imgurViewer = trimmed.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)/i);
  if (imgurViewer) return `https://i.imgur.com/${imgurViewer[1]}.jpg`;

  // 7. Generic image URL
  const genericMatch = trimmed.match(/(https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?[^\s"'<>]*)?)/i);
  if (genericMatch && genericMatch[1]) return genericMatch[1];

  // 8. Any URL as fallback
  const anyUrl = trimmed.match(/(https?:\/\/[^\s"'<>]+)/i);
  if (anyUrl && anyUrl[1]) return anyUrl[1];

  return trimmed;
};

// ========== COURSE FIELD WHITELIST ==========
const COURSE_SCHEMA_FIELDS = ['title', 'description', 'price', 'duration_days', 'grade', 'image_url', 'is_published'];

const sanitizeCourseData = (rawData) => {
  const clean = {};

  if (rawData.thumbnailUrl && !rawData.image_url) {
    rawData.image_url = rawData.thumbnailUrl;
  }

  for (const key of COURSE_SCHEMA_FIELDS) {
    if (rawData[key] !== undefined) {
      clean[key] = rawData[key];
    }
  }

  if ('is_published' in clean) {
    clean.is_published = clean.is_published ? 1 : 0;
  }

  if ('price' in clean) {
    clean.price = Number(clean.price) || 0;
  }

  if ('duration_days' in clean) {
    clean.duration_days = Number(clean.duration_days) || 30;
  }

  if (clean.image_url) {
    clean.image_url = extractDirectImageUrl(clean.image_url);
  }

  return clean;
};

// ========== SMART YOUTUBE EXTRACTOR ==========
export const extractYouTubeId = (input) => {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const regex = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regex);
  if (match && match[1]) return match[1];

  return trimmed;
};

// ========== LECTURE FIELD WHITELIST ==========
const LECTURE_SCHEMA_FIELDS = [
  'youtube_id', 'youtube_url', 'title', 'description', 'course_id', 
  'duration_minutes', 'order_index', 'is_free', 
  'board_url', 'pdf_url', 'board_urls', 'pdf_urls',
  'external_link', 'quiz_id', 'summary_url', 'homework_url'
];

const sanitizeLectureData = (rawData) => {
  const clean = {};

  if (rawData.youtube_url && !rawData.youtube_id) {
    rawData.youtube_id = extractYouTubeId(rawData.youtube_url);
  }
  if (rawData.youtube_id) {
    rawData.youtube_id = extractYouTubeId(rawData.youtube_id);
  }

  for (const key of LECTURE_SCHEMA_FIELDS) {
    if (rawData[key] !== undefined) {
      clean[key] = rawData[key];
    }
  }

  if ('is_free' in clean) {
    clean.is_free = clean.is_free ? 1 : 0;
  }

  if ('duration_minutes' in clean) {
    clean.duration_minutes = Number(clean.duration_minutes) || 0;
  }

  if ('order_index' in clean) {
    clean.order_index = Number(clean.order_index) || 0;
  }

  return clean;
};

// ========== PROFILES ==========
export const createProfile = async (profileData) => {
  return safeDbCall(async () => {
    if (!PROFILES_COLLECTION_ID) return { success: false, error: 'Profiles collection not configured' };
    
    const { id, ...data } = profileData;
    if (data.profilePictureUrl) data.profilePictureUrl = extractDirectImageUrl(data.profilePictureUrl);
    if (data.avatar_url) data.avatar_url = extractDirectImageUrl(data.avatar_url);
    
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      PROFILES_COLLECTION_ID,
      id || ID.unique(),
      data
    );
    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'Failed to create profile' });
};

export const getProfile = async (userId) => {
  return safeDbCall(async () => {
    if (!PROFILES_COLLECTION_ID) return null;
    const doc = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      PROFILES_COLLECTION_ID,
      userId
    );
    return mapDoc(doc);
  }, null);
};

export const updateProfile = async (userId, updates) => {
  return safeDbCall(async () => {
    if (!PROFILES_COLLECTION_ID) return { success: false, error: 'Profiles collection not configured' };
    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      PROFILES_COLLECTION_ID,
      userId,
      updates
    );
    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'Failed to update profile' });
};

export const updateProfileStatus = async (userId, accountStatus) => {
  return safeDbCall(async () => {
    if (!PROFILES_COLLECTION_ID) return { success: false, error: 'Profiles collection not configured' };
    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      PROFILES_COLLECTION_ID,
      userId,
      { accountStatus }
    );
    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'Failed to update profile status' });
};

export const getPendingStudents = async () => {
  return safeDbCall(async () => {
    if (!PROFILES_COLLECTION_ID) return { success: true, data: [] };
    const result = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      PROFILES_COLLECTION_ID,
      [Query.equal('role', 'student'), Query.equal('accountStatus', 'pending')]
    );
    return { success: true, data: result.documents.map(mapDoc) };
  }, { success: true, data: [] });
};

export const getProfiles = async (role = null) => {
  return safeDbCall(async () => {
    if (!PROFILES_COLLECTION_ID) return { success: true, data: [] };
    const queries = [];
    if (role) {
      queries.push(Query.equal('role', role));
      if (role === 'student') {
        queries.push(Query.notEqual('accountStatus', 'pending'));
      }
    }
    const result = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      PROFILES_COLLECTION_ID,
      queries
    );
    return { success: true, data: result.documents.map(mapDoc) };
  }, { success: true, data: [] });
};

// ========== COURSES ==========
export const getCourses = async (filters = {}) => {
  return safeDbCall(async () => {
    if (!COURSES_COLLECTION_ID) return { success: true, data: [] };
    
    const queries = [Query.orderDesc('$createdAt')];
    if (filters.grade) queries.push(Query.equal('grade', filters.grade));
    if (filters.is_published !== undefined) queries.push(Query.equal('is_published', filters.is_published ? 1 : 0));

    const result = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COURSES_COLLECTION_ID,
      queries
    );
    return { success: true, data: result.documents.map(mapDoc) };
  }, { success: true, data: [] });
};

export const getCourse = async (courseId) => {
  return safeDbCall(async () => {
    if (!COURSES_COLLECTION_ID) return { success: false, error: 'Courses collection not configured' };
    
    const courseDoc = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COURSES_COLLECTION_ID,
      courseId
    );

    const lecturesResult = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      LECTURES_COLLECTION_ID,
      [Query.equal('course_id', courseId)]
    );

    const fullCourse = {
      ...mapDoc(courseDoc),
      lectures: lecturesResult.documents.map(mapDoc)
    };

    return { success: true, data: fullCourse };
  }, { success: false, error: 'Failed to get course' });
};

export const createCourse = async (courseData) => {
  return safeDbCall(async () => {
    if (!COURSES_COLLECTION_ID) return { success: false, error: 'Courses collection not configured' };
    
    const safeData = sanitizeCourseData(courseData);
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COURSES_COLLECTION_ID,
      ID.unique(),
      safeData
    );
    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'Failed to create course' });
};

export const updateCourse = async (courseId, updates) => {
  return safeDbCall(async () => {
    if (!COURSES_COLLECTION_ID) return { success: false, error: 'Courses collection not configured' };
    
    const safeUpdates = sanitizeCourseData(updates);
    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COURSES_COLLECTION_ID,
      courseId,
      safeUpdates
    );
    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'Failed to update course' });
};

export const deleteCourse = async (courseId) => {
  return safeDbCall(async () => {
    if (!COURSES_COLLECTION_ID) return { success: false, error: 'Courses collection not configured' };
    
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COURSES_COLLECTION_ID,
      courseId
    );
    return { success: true };
  }, { success: false, error: 'Failed to delete course' });
};

// ========== LECTURES ==========
export const getLectures = async (courseId = null) => {
  return safeDbCall(async () => {
    if (!LECTURES_COLLECTION_ID) return { success: true, data: [] };
    
    const queries = [Query.orderAsc('order_index')];
    if (courseId) queries.push(Query.equal('course_id', courseId));

    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      LECTURES_COLLECTION_ID,
      queries
    );

    const data = await Promise.all(
      documents.map(async (doc) => {
        let course = null;
        if (doc.course_id) {
          try {
            course = await databases.getDocument(
              APPWRITE_DATABASE_ID,
              COURSES_COLLECTION_ID,
              doc.course_id
            );
          } catch(e) {}
        }
        return {
          ...mapDoc(doc),
          courses: course ? mapDoc(course) : null
        };
      })
    );

    return { success: true, data };
  }, { success: true, data: [] });
};

export const createLecture = async (lectureData) => {
  return safeDbCall(async () => {
    if (!LECTURES_COLLECTION_ID) return { success: false, error: 'جدول المحاضرات مش متعرف' };

    const data = {
      title: lectureData.title,
      description: lectureData.description || '',
      youtube_url: lectureData.youtube_url,
      course_id: lectureData.course_id,
      duration_minutes: Number(lectureData.duration_minutes) || 0,
      is_free: lectureData.is_free ? 1 : 0,
      order_index: Number(lectureData.order_index) || 0,
      summary_url: lectureData.summary_url || '',
      homework_url: lectureData.homework_url || '',
      external_link: lectureData.external_link || ''
    };

    if (lectureData.quiz_id) data.quiz_id = lectureData.quiz_id;

    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      LECTURES_COLLECTION_ID,
      ID.unique(),
      data
    );
    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'فشل في إنشاء المحاضرة - تأكد من أسماء الخانات في Appwrite' });
};

export const updateLecture = async (lectureId, updates) => {
  return safeDbCall(async () => {
    if (!LECTURES_COLLECTION_ID) return { success: false, error: 'جدول المحاضرات غير معرف' };
    
    const safeUpdates = {};
    const allowedKeys = ['title', 'description', 'youtube_url', 'course_id', 
      'duration_minutes', 'order_index', 'is_free', 'external_link', 'quiz_id',
      'summary_url', 'homework_url'];
    
    for (const key of allowedKeys) {
      if (updates[key] !== undefined) {
        safeUpdates[key] = updates[key];
      }
    }

    if ('is_free' in safeUpdates) safeUpdates.is_free = safeUpdates.is_free ? 1 : 0;
    if ('duration_minutes' in safeUpdates) safeUpdates.duration_minutes = Number(safeUpdates.duration_minutes) || 0;
    if ('order_index' in safeUpdates) safeUpdates.order_index = Number(safeUpdates.order_index) || 0;
    
    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      LECTURES_COLLECTION_ID,
      lectureId,
      safeUpdates
    );
    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'فشل في تحديث المحاضرة' });
};

export const deleteLecture = async (lectureId) => {
  return safeDbCall(async () => {
    if (!LECTURES_COLLECTION_ID) return { success: false, error: 'Lectures collection not configured' };
    
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      LECTURES_COLLECTION_ID,
      lectureId
    );
    return { success: true };
  }, { success: false, error: 'Failed to delete lecture' });
};

// ========== ENROLLMENTS ==========
export const getUserEnrollments = async (userId) => {
  return safeDbCall(async () => {
    if (!ENROLLMENTS_COLLECTION_ID) return { success: true, data: [] };
    
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      ENROLLMENTS_COLLECTION_ID,
      [Query.equal('user_id', userId), Query.equal('status', 'active')]
    );

    const data = await Promise.all(
      documents.map(async (doc) => {
        let course = null;
        try {
          course = await databases.getDocument(
            APPWRITE_DATABASE_ID,
            COURSES_COLLECTION_ID,
            doc.course_id
          );
        } catch(e) {}
        return {
          ...mapDoc(doc),
          courses: course ? mapDoc(course) : null
        };
      })
    );

    return { success: true, data };
  }, { success: true, data: [] });
};

export const getEnrolledCourses = async (userId) => {
  return safeDbCall(async () => {
    if (!ENROLLMENTS_COLLECTION_ID) return { success: true, data: [] };
    
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      ENROLLMENTS_COLLECTION_ID,
      [Query.equal('user_id', userId), Query.equal('status', 'active')]
    );

    const courses = [];
    for (const doc of documents) {
      try {
        const course = await databases.getDocument(
          APPWRITE_DATABASE_ID,
          COURSES_COLLECTION_ID,
          doc.course_id
        );
        if (course) courses.push({ ...mapDoc(course), enrollment: mapDoc(doc) });
      } catch(e) {}
    }

    return { success: true, data: courses };
  }, { success: true, data: [] });
};

export const getSuggestedCourses = async (grade = null) => {
  return safeDbCall(async () => {
    if (!COURSES_COLLECTION_ID) return { success: true, data: [] };
    
    const queries = [Query.orderDesc('$createdAt')];
    if (grade) queries.push(Query.equal('grade', grade));
    queries.push(Query.equal('is_published', 1));
    
    const result = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COURSES_COLLECTION_ID,
      queries
    );
    return { success: true, data: result.documents.map(mapDoc) };
  }, { success: true, data: [] });
};

export const enrollInCourse = async (userId, courseId) => {
  return safeDbCall(async () => {
    if (!ENROLLMENTS_COLLECTION_ID) return { success: false, error: 'Enrollments collection not configured' };
    
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      ENROLLMENTS_COLLECTION_ID,
      [Query.equal('user_id', userId), Query.equal('course_id', courseId), Query.limit(1)]
    );

    const existing = documents.length > 0 ? documents[0] : null;

    if (existing) {
      if (existing.status === 'active') {
        return { success: false, error: 'أنت مشترك بالفعل في هذا الكورس' };
      }
      
      const doc = await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        ENROLLMENTS_COLLECTION_ID,
        existing.$id,
        { 
          status: 'active',
          enrolled_at: new Date().toISOString()
        }
      );
      return { success: true, data: mapDoc(doc) };
    }

    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      ENROLLMENTS_COLLECTION_ID,
      ID.unique(),
      {
        user_id: userId,
        course_id: courseId,
        status: 'active',
        enrolled_at: new Date().toISOString()
      }
    );

    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'Failed to enroll in course' });
};

export const deactivateEnrollment = async (enrollmentId) => {
  return safeDbCall(async () => {
    if (!ENROLLMENTS_COLLECTION_ID) return { success: false, error: 'Enrollments collection not configured' };
    
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      ENROLLMENTS_COLLECTION_ID,
      enrollmentId,
      { status: 'expired' }
    );
    return { success: true };
  }, { success: false, error: 'Failed to deactivate enrollment' });
};

// ========== PAYMENT REQUESTS ==========
export const createPaymentRequest = async (paymentData) => {
  return safeDbCall(async () => {
    if (!PAYMENT_REQUESTS_COLLECTION_ID) return { success: false, error: 'Payment requests collection not configured' };
    
    // Map existing code keys to the specific Appwrite schema keys requested
    const mappedData = {
      ...paymentData,
      payerId: paymentData.user_id || paymentData.payerId || '',
      requestStatus: 'pending',
      requestDate: new Date().toISOString(),
      amount: parseFloat(paymentData.amount) || 0,
      currency: paymentData.currency || 'EGP',
      paymentMethod: paymentData.paymentMethod || paymentData.payment_method || 'cash'
    };

    // Remove old fields so Appwrite strict schema won't reject the payload
    delete mappedData.user_id;
    delete mappedData.status;
    delete mappedData.created_at;
    delete mappedData.payment_method;

    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      PAYMENT_REQUESTS_COLLECTION_ID,
      mappedData.requestId || ID.unique(),
      mappedData
    );
    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'Failed to create payment request' });
};

export const getPaymentRequests = async (status = null) => {
  return safeDbCall(async () => {
    if (!PAYMENT_REQUESTS_COLLECTION_ID) return { success: true, data: [] };
    
    const queries = [Query.orderDesc('requestDate')];
    if (status) queries.push(Query.equal('requestStatus', status));

    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      PAYMENT_REQUESTS_COLLECTION_ID,
      queries
    );

    const data = await Promise.all(
      documents.map(async (doc) => {
        let profile = null;
        let course = null;
        try {
          if (doc.payerId) {
            profile = await databases.getDocument(
              APPWRITE_DATABASE_ID,
              PROFILES_COLLECTION_ID,
              doc.payerId
            );
          }
        } catch(e) {}
        try {
          if (doc.course_id) {
            course = await databases.getDocument(
              APPWRITE_DATABASE_ID,
              COURSES_COLLECTION_ID,
              doc.course_id
            );
          }
        } catch(e) {}

        return {
          ...mapDoc(doc),
          profiles: profile ? mapDoc(profile) : null,
          courses: course ? mapDoc(course) : null
        };
      })
    );

    return { success: true, data };
  }, { success: true, data: [] });
};

export const updatePaymentRequest = async (requestId, updates) => {
  return safeDbCall(async () => {
    if (!PAYMENT_REQUESTS_COLLECTION_ID) return { success: false, error: 'Payment requests collection not configured' };
    
    // Transparently map 'status' to 'requestStatus' to maintain compatibility
    const mappedUpdates = { ...updates };
    if (mappedUpdates.status) {
      mappedUpdates.requestStatus = mappedUpdates.status;
      delete mappedUpdates.status;
    }

    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      PAYMENT_REQUESTS_COLLECTION_ID,
      requestId,
      mappedUpdates
    );

    if (mappedUpdates.requestStatus === 'approved' && doc.payerId && doc.course_id) {
      await enrollInCourse(doc.payerId, doc.course_id);
    }

    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'Failed to update payment request' });
};

// ========== CENTER CODES ==========
export const generatePackageCode = async ({ courseIds, usageLimit = 1, expiryDays = 30, label = '' }) => {
  return safeDbCall(async () => {
    if (!CENTER_CODES_COLLECTION_ID) return { success: false, error: 'Center codes collection not configured' };
    
    const code = `PKG-${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.floor(Math.random() * 9000 + 1000)}`;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      CENTER_CODES_COLLECTION_ID,
      ID.unique(),
      {
        code,
        course_id: courseIds[0] || '',
        course_ids: courseIds,
        usageLimit,
        currentUsage: 0,
        expiryDate: expiryDate.toISOString(),
        label: label || `باقة ${courseIds.length} كورس`
      }
    );
    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'Failed to generate code' });
};

export const validateCenterCode = async (code) => {
  return safeDbCall(async () => {
    if (!CENTER_CODES_COLLECTION_ID) return { success: false, error: 'Center codes collection not configured' };
    
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      CENTER_CODES_COLLECTION_ID,
      [Query.equal('code', code), Query.limit(1)]
    );

    if (documents.length === 0) {
      return { success: false, error: 'الكود غير موجود' };
    }

    const data = documents[0];
    
    const usageLimit = data.usageLimit || 1;
    const currentUsage = data.currentUsage || 0;
    if (currentUsage >= usageLimit) {
      return { success: false, error: 'تم استخدام هذا الكود الحد الأقصى من المرات' };
    }

    if (data.expiryDate && new Date(data.expiryDate) < new Date()) {
      return { success: false, error: 'انتهت صلاحية الكود' };
    }

    let course = null;
    try {
      course = await databases.getDocument(
        APPWRITE_DATABASE_ID,
        COURSES_COLLECTION_ID,
        data.course_id
      );
    } catch(e) {}

    return { success: true, data: { ...mapDoc(data), courses: course ? mapDoc(course) : null } };
  }, { success: false, error: 'الكود غير صالح' });
};

export const useCenterCode = async (code, userId) => {
  return safeDbCall(async () => {
    const validation = await validateCenterCode(code);
    if (!validation.success) return validation;

    const docId = validation.data.$id || validation.data.id;
    const codeData = validation.data;

    const newUsage = (codeData.currentUsage || 0) + 1;
    const updatePayload = { currentUsage: newUsage };
    
    if (newUsage >= (codeData.usageLimit || 1)) {
      updatePayload.is_used = true;
    }
    updatePayload.used_by = userId;
    updatePayload.used_at = new Date().toISOString();

    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      CENTER_CODES_COLLECTION_ID,
      docId,
      updatePayload
    );

    const courseIds = codeData.course_ids && codeData.course_ids.length > 0 
      ? codeData.course_ids 
      : (codeData.course_id ? [codeData.course_id] : []);

    for (const courseId of courseIds) {
      await enrollInCourse(userId, courseId);
    }

    return { 
      success: true, 
      courseId: courseIds[0],
      courseName: validation.data.courses?.title || 'باقة',
      coursesCount: courseIds.length
    };
  }, { success: false, error: 'Failed to use code' });
};

export const getCenterCodesList = async () => {
  return safeDbCall(async () => {
    if (!CENTER_CODES_COLLECTION_ID) return { success: true, data: [] };
    
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      CENTER_CODES_COLLECTION_ID,
      [Query.orderDesc('$createdAt')]
    );

    const data = await Promise.all(
      documents.map(async (doc) => {
        let course = null;
        try {
          course = await databases.getDocument(
            APPWRITE_DATABASE_ID,
            COURSES_COLLECTION_ID,
            doc.course_id
          );
        } catch(e) {}

        return {
          ...mapDoc(doc),
          courses: course ? mapDoc(course) : null
        };
      })
    );

    return { success: true, data };
  }, { success: true, data: [] });
};

// ========== QUIZZES ==========
export const getQuizzesByCourse = async (courseId) => {
  return safeDbCall(async () => {
    if (!QUIZZES_COLLECTION_ID) return { success: true, data: [] };
    
    const queries = courseId ? [Query.equal('course_id', courseId)] : [];
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID, 
      QUIZZES_COLLECTION_ID, 
      queries
    );
    return { success: true, data: documents.map(mapDoc) };
  }, { success: true, data: [] });
};

export const getAllQuizzes = async () => {
  return safeDbCall(async () => {
    if (!QUIZZES_COLLECTION_ID) return { success: true, data: [] };
    
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID, 
      QUIZZES_COLLECTION_ID
    );
    return { success: true, data: documents.map(mapDoc) };
  }, { success: true, data: [] });
};

export const createQuiz = async (data) => {
  return safeDbCall(async () => {
    if (!QUIZZES_COLLECTION_ID) return { success: false, error: 'Quizzes collection not configured' };
    
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID, 
      QUIZZES_COLLECTION_ID, 
      ID.unique(), 
      {
        title: data.title || '',
        course_id: data.course_id || '',
        duration_minutes: Number(data.duration_minutes) || 0,
        show_result: data.show_result ? 1 : 0,
        allow_pause: data.allow_pause ? 1 : 0,
        is_active: 1,
      }
    );
    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'Failed to create quiz' });
};

export const deleteQuiz = async (id) => {
  return safeDbCall(async () => {
    if (!QUIZZES_COLLECTION_ID) return { success: false, error: 'Quizzes collection not configured' };
    
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID, 
      QUIZZES_COLLECTION_ID, 
      id
    );
    return { success: true };
  }, { success: false, error: 'Failed to delete quiz' });
};

// ========== QUIZ QUESTIONS ==========
export const getQuizQuestions = async (quizId) => {
  return safeDbCall(async () => {
    if (!QUIZ_QUESTIONS_COLLECTION_ID) return { success: true, data: [] };
    
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID, 
      QUIZ_QUESTIONS_COLLECTION_ID, 
      [
        Query.equal('quiz_id', quizId),
        Query.orderAsc('order_index'),
      ]
    );
    return { success: true, data: documents.map(mapDoc) };
  }, { success: true, data: [] });
};

export const createQuizQuestion = async (data) => {
  return safeDbCall(async () => {
    if (!QUIZ_QUESTIONS_COLLECTION_ID) return { success: false, error: 'Quiz questions collection not configured' };
    
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID, 
      QUIZ_QUESTIONS_COLLECTION_ID, 
      ID.unique(), 
      {
        quiz_id: data.quiz_id,
        question_text: data.question_text || '',
        option_a: data.option_a || '',
        option_b: data.option_b || '',
        option_c: data.option_c || '',
        option_d: data.option_d || '',
        correct_answer: data.correct_answer || 'a',
        order_index: Number(data.order_index) || 0,
      }
    );
    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'Failed to create quiz question' });
};

export const deleteQuizQuestion = async (id) => {
  return safeDbCall(async () => {
    if (!QUIZ_QUESTIONS_COLLECTION_ID) return { success: false, error: 'Quiz questions collection not configured' };
    
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID, 
      QUIZ_QUESTIONS_COLLECTION_ID, 
      id
    );
    return { success: true };
  }, { success: false, error: 'Failed to delete quiz question' });
};

// ========== WRONG ANSWERS ==========
export const getWrongAnswers = async (userId) => {
  return safeDbCall(async () => {
    if (!WRONG_ANSWERS_COLLECTION_ID) return { success: true, data: [] };
    
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID, 
      WRONG_ANSWERS_COLLECTION_ID, 
      [
        Query.equal('user_id', userId),
        Query.orderDesc('$createdAt'),
      ]
    );
    return { success: true, data: documents.map(mapDoc) };
  }, { success: true, data: [] });
};

export const saveWrongAnswer = async (data) => {
  return safeDbCall(async () => {
    if (!WRONG_ANSWERS_COLLECTION_ID) return { success: false, error: 'Wrong answers collection not configured' };
    
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID, 
      WRONG_ANSWERS_COLLECTION_ID, 
      ID.unique(), 
      {
        user_id: data.user_id,
        quiz_id: data.quiz_id,
        question_id: data.question_id,
        question_text: data.question_text || '',
        user_answer: data.user_answer || '',
        correct_answer: data.correct_answer || '',
        option_a: data.option_a || '',
        option_b: data.option_b || '',
        option_c: data.option_c || '',
        option_d: data.option_d || '',
      }
    );
    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'Failed to save wrong answer' });
};

export const deleteWrongAnswer = async (id) => {
  return safeDbCall(async () => {
    if (!WRONG_ANSWERS_COLLECTION_ID) return { success: false, error: 'Wrong answers collection not configured' };
    
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID, 
      WRONG_ANSWERS_COLLECTION_ID, 
      id
    );
    return { success: true };
  }, { success: false, error: 'Failed to delete wrong answer' });
};

// ========== ANNOUNCEMENTS ==========
export const getAnnouncements = async () => {
  return safeDbCall(async () => {
    if (!ANNOUNCEMENTS_COLLECTION_ID) return { success: true, data: [] };
    
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      ANNOUNCEMENTS_COLLECTION_ID,
      [Query.orderDesc('$createdAt')]
    );
    return { success: true, data: documents.map(mapDoc) };
  }, { success: true, data: [] });
};

export const createAnnouncement = async (data) => {
  return safeDbCall(async () => {
    if (!ANNOUNCEMENTS_COLLECTION_ID) return { success: false, error: 'Announcements collection not configured' };
    
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      ANNOUNCEMENTS_COLLECTION_ID,
      ID.unique(),
      {
        image_url: data.image_url || '',
        link: data.link || '',
        title: data.title || '',
        is_active: 1,
      }
    );
    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'Failed to create announcement' });
};

export const deleteAnnouncement = async (id) => {
  return safeDbCall(async () => {
    if (!ANNOUNCEMENTS_COLLECTION_ID) return { success: false, error: 'Announcements collection not configured' };
    
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID, 
      ANNOUNCEMENTS_COLLECTION_ID, 
      id
    );
    return { success: true };
  }, { success: false, error: 'Failed to delete announcement' });
};

// ========== ASSIGNMENTS & LECTURE PROGRESS ==========
export const submitAssignment = async (userId, lectureId) => {
  return safeDbCall(async () => {
    if (!ASSIGNMENTS_COLLECTION_ID) {
      return { success: false, error: 'Assignments collection not configured' };
    }

    // Check if already submitted
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      ASSIGNMENTS_COLLECTION_ID,
      [Query.equal('user_id', userId), Query.equal('lecture_id', lectureId), Query.limit(1)]
    );

    if (documents.length > 0) {
      return { success: false, error: 'لقد قمت بتسليم الواجب مسبقاً' };
    }

    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      ASSIGNMENTS_COLLECTION_ID,
      ID.unique(),
      {
        user_id: userId,
        lecture_id: lectureId,
        submitted_at: new Date().toISOString(),
        status: 'completed',
      }
    );

    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'Failed to submit assignment' });
};

export const getCompletedLectures = async (userId) => {
  return safeDbCall(async () => {
    if (!ASSIGNMENTS_COLLECTION_ID) return { success: true, data: [] };
    
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      ASSIGNMENTS_COLLECTION_ID,
      [Query.equal('user_id', userId), Query.equal('status', 'completed')]
    );

    return { success: true, data: documents.map(mapDoc) };
  }, { success: true, data: [] });
};

// ========== LEGACY SUPPORT ==========
export const getExams = async () => {
  console.warn('getExams is deprecated, use getQuizzesByCourse instead');
  return { success: true, data: [] };
};

export const getWhiteboards = async () => {
  console.warn('getWhiteboards is deprecated');
  return { success: true, data: [] };
};
// ========== أكواد السنتر (تكملة الدوال الممسوحة) ==========

export const generateStudentCenterCode = async (data) => {
  return safeDbCall(async () => {
    if (!CENTER_CODES_COLLECTION_ID) return { success: false, error: 'لم يتم إعداد جدول الأكواد' };
    
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      CENTER_CODES_COLLECTION_ID,
      ID.unique(),
      {
        code: data.code,
        course_id: data.course_id,
        is_used: false
      }
    );
    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'فشل في توليد الكود' });
};

export const getCenterCodes = async () => {
  return safeDbCall(async () => {
    if (!CENTER_CODES_COLLECTION_ID) return { success: true, data: [] };
    
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      CENTER_CODES_COLLECTION_ID,
      [Query.orderDesc('$createdAt')]
    );
    return { success: true, data: documents.map(mapDoc) };
  }, { success: true, data: [] });
};

export const deleteCenterCode = async (id) => {
  return safeDbCall(async () => {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      CENTER_CODES_COLLECTION_ID,
      id
    );
    return { success: true };
  }, { success: false, error: 'فشل في حذف الكود' });
};
// ========== أكواد السنتر (Center Codes) ==========
export const validateStudentCenterCode = async (code) => {
  return safeDbCall(async () => {
    if (!CENTER_CODES_COLLECTION_ID) {
      return { success: false, error: 'لم يتم إعداد جدول أكواد السنتر' };
    }

    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      CENTER_CODES_COLLECTION_ID,
      [
        Query.equal('code', code),
        Query.equal('is_used', false) // أو 0 لو عاملها رقم
      ]
    );

    if (documents.length === 0) {
      return { success: false, error: 'الكود غير صحيح أو تم استخدامه مسبقاً' };
    }

    return { success: true, data: mapDoc(documents[0]) };
  }, { success: false, error: 'فشل في التحقق من الكود' });
};

// دالة تفعيل الكود (عشان لو ممسوحة هي كمان)
export const activateCenterCode = async (docId, userId) => {
  return safeDbCall(async () => {
    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      CENTER_CODES_COLLECTION_ID,
      docId,
      {
        is_used: true, // أو 1
        used_by: userId,
        used_at: new Date().toISOString()
      }
    );
    return { success: true, data: mapDoc(doc) };
  }, { success: false, error: 'فشل في تفعيل الكود' });
};