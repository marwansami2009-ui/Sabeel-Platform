import { supabase } from '../supabaseClient';
// ========== PROFILES ==========
export const createProfile = async (profileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Create profile error:', error);
    return { success: false, error: error.message };
  }
};

export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
};

export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: error.message };
  }
};

// ========== COURSES ==========
export const getCourses = async (filters = {}) => {
  try {
    let query = supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.grade) {
      query = query.eq('grade', filters.grade);
    }
    if (filters.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get courses error:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const getCourse = async (courseId) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        lectures (*)
      `)
      .eq('id', courseId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get course error:', error);
    return { success: false, error: error.message };
  }
};

export const createCourse = async (courseData) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert([{
        ...courseData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Create course error:', error);
    return { success: false, error: error.message };
  }
};

export const updateCourse = async (courseId, updates) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Update course error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteCourse = async (courseId) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete course error:', error);
    return { success: false, error: error.message };
  }
};

// ========== LECTURES ==========
export const getLectures = async (courseId = null) => {
  try {
    let query = supabase
      .from('lectures')
      .select(`
        *,
        courses (
          id,
          title,
          grade
        )
      `)
      .order('order_index', { ascending: true });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get lectures error:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const createLecture = async (lectureData) => {
  try {
    const { data, error } = await supabase
      .from('lectures')
      .insert([{
        ...lectureData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Create lecture error:', error);
    return { success: false, error: error.message };
  }
};

export const updateLecture = async (lectureId, updates) => {
  try {
    const { data, error } = await supabase
      .from('lectures')
      .update(updates)
      .eq('id', lectureId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Update lecture error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteLecture = async (lectureId) => {
  try {
    const { error } = await supabase
      .from('lectures')
      .delete()
      .eq('id', lectureId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete lecture error:', error);
    return { success: false, error: error.message };
  }
};

// ========== ENROLLMENTS ==========
export const getUserEnrollments = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get enrollments error:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const enrollInCourse = async (userId, courseId) => {
  try {
    // Check if already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'active') {
        return { success: false, error: 'أنت مشترك بالفعل في هذا الكورس' };
      }
      
      // Reactivate if expired
      const { data, error } = await supabase
        .from('enrollments')
        .update({ 
          status: 'active',
          enrolled_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    }

    // New enrollment
    const { data, error } = await supabase
      .from('enrollments')
      .insert([{
        user_id: userId,
        course_id: courseId,
        status: 'active',
        enrolled_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Enroll error:', error);
    return { success: false, error: error.message };
  }
};

export const deactivateEnrollment = async (enrollmentId) => {
  try {
    const { error } = await supabase
      .from('enrollments')
      .update({ status: 'expired' })
      .eq('id', enrollmentId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Deactivate enrollment error:', error);
    return { success: false, error: error.message };
  }
};

// ========== PAYMENT REQUESTS ==========
export const createPaymentRequest = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('payment_requests')
      .insert([{
        ...paymentData,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Create payment request error:', error);
    return { success: false, error: error.message };
  }
};

export const getPaymentRequests = async (status = null) => {
  try {
    let query = supabase
      .from('payment_requests')
      .select(`
        *,
        profiles:user_id (name, email, phone),
        courses:course_id (title, price)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get payment requests error:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const updatePaymentRequest = async (requestId, updates) => {
  try {
    const { data, error } = await supabase
      .from('payment_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    // If approved, automatically enroll the student
    if (updates.status === 'approved') {
      await enrollInCourse(data.user_id, data.course_id);
    }

    return { success: true, data };
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
      
      const { data, error } = await supabase
        .from('center_codes')
        .insert([{
          code,
          course_id: courseId,
          expiry_date: expiryDate.toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      codes.push(data);
    }

    return { success: true, data: codes };
  } catch (error) {
    console.error('Generate codes error:', error);
    return { success: false, error: error.message };
  }
};

export const validateCenterCode = async (code) => {
  try {
    const { data, error } = await supabase
      .from('center_codes')
      .select(`
        *,
        courses:course_id (id, title)
      `)
      .eq('code', code)
      .single();

    if (error) throw error;

    if (data.is_used) {
      return { success: false, error: 'هذا الكود مستخدم بالفعل' };
    }

    if (new Date(data.expiry_date) < new Date()) {
      return { success: false, error: 'انتهت صلاحية الكود' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Validate code error:', error);
    return { success: false, error: 'الكود غير صالح' };
  }
};

export const useCenterCode = async (code, userId) => {
  try {
    // Validate first
    const validation = await validateCenterCode(code);
    if (!validation.success) return validation;

    // Mark as used
    const { error: updateError } = await supabase
      .from('center_codes')
      .update({
        is_used: true,
        used_by: userId,
        used_at: new Date().toISOString()
      })
      .eq('code', code);

    if (updateError) throw updateError;

    // Enroll user in the course
    const enrollment = await enrollInCourse(userId, validation.data.course_id);
    if (!enrollment.success) throw new Error(enrollment.error);

    return { 
      success: true, 
      courseId: validation.data.course_id,
      courseName: validation.data.courses.title
    };
  } catch (error) {
    console.error('Use code error:', error);
    return { success: false, error: error.message };
  }
};

export const getProfiles = async (role = null) => {
  try {
    let query = supabase.from('profiles').select('*');
    if (role) query = query.eq('role', role);
    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get profiles error:', error);
    return { success: false, data: [] };
  }
};