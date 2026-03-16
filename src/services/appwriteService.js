import { databases } from '../appwriteConfig';
import { ID, Query } from 'appwrite';

export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const PROFILES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID;
export const COURSES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COURSES_COLLECTION_ID;
export const LECTURES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_LECTURES_COLLECTION_ID;
export const ENROLLMENTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_ENROLLMENTS_COLLECTION_ID;
export const PAYMENT_REQUESTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PAYMENT_REQUESTS_COLLECTION_ID;
export const CENTER_CODES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CENTER_CODES_COLLECTION_ID;
export const EXAMS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_EXAMS_COLLECTION_ID;
export const WHITEBOARDS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_WHITEBOARDS_COLLECTION_ID;

// Helper for mapping Appwrite $id to id 
const mapDoc = (doc) => {
  if (!doc) return null;
  const newDoc = { ...doc, id: doc.$id };
  return newDoc;
};

// ========== PROFILES ==========
export const createProfile = async (profileData) => {
  try {
    const { id, ...data } = profileData;
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      PROFILES_COLLECTION_ID,
      id || ID.unique(),
      data
    );
    return { success: true, data: mapDoc(doc) };
  } catch (error) {
    console.error('Create profile error:', error);
    return { success: false, error: error.message };
  }
};

export const getProfile = async (userId) => {
  try {
    const doc = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      PROFILES_COLLECTION_ID,
      userId
    );
    return mapDoc(doc);
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
};

export const updateProfile = async (userId, updates) => {
  try {
    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      PROFILES_COLLECTION_ID,
      userId,
      updates
    );
    return { success: true, data: mapDoc(doc) };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: error.message };
  }
};

export const updateProfileStatus = async (userId, accountStatus) => {
  try {
    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      PROFILES_COLLECTION_ID,
      userId,
      { accountStatus } // Map correctly to the new column
    );
    return { success: true, data: mapDoc(doc) };
  } catch (error) {
    console.error('Update profile status error:', error);
    return { success: false, error: error.message };
  }
};

export const getPendingStudents = async () => {
  try {
    const result = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      PROFILES_COLLECTION_ID,
      [Query.equal('role', 'student'), Query.equal('accountStatus', 'pending')]
    );
    return { success: true, data: result.documents.map(mapDoc) };
  } catch (error) {
    console.error('Get pending students error:', error);
    return { success: false, data: [] };
  }
};

export const getProfiles = async (role = null) => {
  try {
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
  } catch (error) {
    console.error('Get profiles error:', error);
    return { success: false, data: [] };
  }
};

// ========== COURSES ==========
export const getCourses = async (filters = {}) => {
  try {
    const queries = [Query.orderDesc('created_at')];
    if (filters.grade) {
      queries.push(Query.equal('grade', filters.grade));
    }
    if (filters.is_published !== undefined) {
      queries.push(Query.equal('is_published', filters.is_published));
    }

    const result = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COURSES_COLLECTION_ID,
      queries
    );
    return { success: true, data: result.documents.map(mapDoc) };
  } catch (error) {
    console.error('Get courses error:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const getCourse = async (courseId) => {
  try {
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
    }

    return { success: true, data: fullCourse };
  } catch (error) {
    console.error('Get course error:', error);
    return { success: false, error: error.message };
  }
};

export const createCourse = async (courseData) => {
  try {
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COURSES_COLLECTION_ID,
      ID.unique(),
      { ...courseData, created_at: new Date().toISOString() }
    );
    return { success: true, data: mapDoc(doc) };
  } catch (error) {
    console.error('Create course error:', error);
    return { success: false, error: error.message };
  }
};

export const updateCourse = async (courseId, updates) => {
  try {
    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COURSES_COLLECTION_ID,
      courseId,
      updates
    );
    return { success: true, data: mapDoc(doc) };
  } catch (error) {
    console.error('Update course error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteCourse = async (courseId) => {
  try {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COURSES_COLLECTION_ID,
      courseId
    );
    return { success: true };
  } catch (error) {
    console.error('Delete course error:', error);
    return { success: false, error: error.message };
  }
};

// ========== LECTURES ==========
export const getLectures = async (courseId = null) => {
  try {
    const queries = [Query.orderAsc('order_index')];
    if (courseId) {
      queries.push(Query.equal('course_id', courseId));
    }

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
  } catch (error) {
    console.error('Get lectures error:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const createLecture = async (lectureData) => {
  try {
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      LECTURES_COLLECTION_ID,
      ID.unique(),
      { ...lectureData, created_at: new Date().toISOString() }
    );
    return { success: true, data: mapDoc(doc) };
  } catch (error) {
    console.error('Create lecture error:', error);
    return { success: false, error: error.message };
  }
};

export const updateLecture = async (lectureId, updates) => {
  try {
    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      LECTURES_COLLECTION_ID,
      lectureId,
      updates
    );
    return { success: true, data: mapDoc(doc) };
  } catch (error) {
    console.error('Update lecture error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteLecture = async (lectureId) => {
  try {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      LECTURES_COLLECTION_ID,
      lectureId
    );
    return { success: true };
  } catch (error) {
    console.error('Delete lecture error:', error);
    return { success: false, error: error.message };
  }
};

// ========== ENROLLMENTS ==========
export const getUserEnrollments = async (userId) => {
  try {
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
  } catch (error) {
    console.error('Get enrollments error:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const enrollInCourse = async (userId, courseId) => {
  try {
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
  } catch (error) {
    console.error('Enroll error:', error);
    return { success: false, error: error.message };
  }
};

export const deactivateEnrollment = async (enrollmentId) => {
  try {
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      ENROLLMENTS_COLLECTION_ID,
      enrollmentId,
      { status: 'expired' }
    );
    return { success: true };
  } catch (error) {
    console.error('Deactivate enrollment error:', error);
    return { success: false, error: error.message };
  }
};

// ========== PAYMENT REQUESTS ==========
export const createPaymentRequest = async (paymentData) => {
  try {
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      PAYMENT_REQUESTS_COLLECTION_ID,
      ID.unique(),
      {
        ...paymentData,
        status: 'pending',
        created_at: new Date().toISOString()
      }
    );
    return { success: true, data: mapDoc(doc) };
  } catch (error) {
    console.error('Create payment request error:', error);
    return { success: false, error: error.message };
  }
};

export const getPaymentRequests = async (status = null) => {
  try {
    const queries = [Query.orderDesc('created_at')];
    if (status) {
      queries.push(Query.equal('status', status));
    }

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
           profile = await databases.getDocument(
               APPWRITE_DATABASE_ID,
               PROFILES_COLLECTION_ID,
               doc.user_id
           );
        } catch(e) {}
        try {
           course = await databases.getDocument(
               APPWRITE_DATABASE_ID,
               COURSES_COLLECTION_ID,
               doc.course_id
           );
        } catch(e) {}

        return {
          ...mapDoc(doc),
          profiles: profile ? mapDoc(profile) : null,
          courses: course ? mapDoc(course) : null
        };
      })
    );

    return { success: true, data };
  } catch (error) {
    console.error('Get payment requests error:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const updatePaymentRequest = async (requestId, updates) => {
  try {
    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      PAYMENT_REQUESTS_COLLECTION_ID,
      requestId,
      updates
    );

    if (updates.status === 'approved') {
      await enrollInCourse(doc.user_id, doc.course_id);
    }

    return { success: true, data: mapDoc(doc) };
  } catch (error) {
    console.error('Update payment request error:', error);
    return { success: false, error: error.message };
  }
};

// ========== CENTER CODES ==========
export const generateCenterCodes = async (count, courseId, expiryDays = 30) => {
  try {
    const codes = [];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    for (let i = 0; i < count; i++) {
      const code = `C${Math.random().toString(36).substring(2, 8).toUpperCase()}${Math.floor(Math.random() * 1000)}`;
      
      const doc = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        CENTER_CODES_COLLECTION_ID,
        ID.unique(),
        {
          code,
          course_id: courseId,
          expiry_date: expiryDate.toISOString(),
          created_at: new Date().toISOString()
        }
      );

      codes.push(mapDoc(doc));
    }

    return { success: true, data: codes };
  } catch (error) {
    console.error('Generate codes error:', error);
    return { success: false, error: error.message };
  }
};

export const validateCenterCode = async (code) => {
  try {
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      CENTER_CODES_COLLECTION_ID,
      [Query.equal('code', code), Query.limit(1)]
    );

    if (documents.length === 0) {
       throw new Error('Code not found');
    }

    const data = documents[0];
    
    if (data.is_used) {
      return { success: false, error: 'هذا الكود مستخدم بالفعل' };
    }

    if (new Date(data.expiry_date) < new Date()) {
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
  } catch (error) {
    console.error('Validate code error:', error);
    return { success: false, error: 'الكود غير صالح' };
  }
};

export const useCenterCode = async (code, userId) => {
  try {
    const validation = await validateCenterCode(code);
    if (!validation.success) return validation;

    const docId = validation.data.$id || validation.data.id;

    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      CENTER_CODES_COLLECTION_ID,
      docId,
      {
        is_used: true,
        used_by: userId,
        used_at: new Date().toISOString()
      }
    );

    const enrollment = await enrollInCourse(userId, validation.data.course_id);
    if (!enrollment.success) throw new Error(enrollment.error);

    return { 
      success: true, 
      courseId: validation.data.course_id,
      courseName: validation.data.courses?.title || 'Course'
    };
  } catch (error) {
    console.error('Use code error:', error);
    return { success: false, error: error.message };
  }
};

export const getCenterCodesList = async () => {
  try {
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      CENTER_CODES_COLLECTION_ID,
      [Query.orderDesc('created_at')]
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
  } catch (error) {
    console.error('Get center codes error:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ========== EXAMS ==========
export const getExams = async () => {
  try {
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      EXAMS_COLLECTION_ID
    );
    return { success: true, data: documents.map(mapDoc) };
  } catch (error) {
    console.error('Get exams error:', error);
    return { success: false, data: [] };
  }
};

// ========== WHITEBOARDS ==========
export const getWhiteboards = async () => {
  try {
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      WHITEBOARDS_COLLECTION_ID
    );
    return { success: true, data: documents.map(mapDoc) };
  } catch (error) {
    console.error('Get whiteboards error:', error);
    return { success: false, data: [] };
  }
};