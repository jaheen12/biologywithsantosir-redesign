'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Initialize Supabase Admin client
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// 1. Create Student
export async function createStudent(formData: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  batchId?: string;
}) {
  try {
    const supabase = await createClient();
    
    // Verify caller is admin
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller || caller.app_metadata?.role !== 'admin') {
      return { error: 'অননুমোদিত অ্যাক্সেস।' };
    }

    const supabaseAdmin = getAdminClient();

    // Create user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: {
        full_name: formData.fullName,
        phone: formData.phone,
      }
    });

    if (authError) {
      throw new Error(authError.message || 'ব্যবহারকারী তৈরিতে সমস্যা হয়েছে।');
    }

    const studentId = authData.user?.id;
    if (!studentId) {
      throw new Error('ব্যবহারকারী আইডি পাওয়া যায়নি।');
    }

    // Set role in auth app_metadata
    await supabaseAdmin.auth.admin.updateUserById(studentId, {
      app_metadata: { role: 'student' }
    });

    // Explicitly update profile role to ensure consistency
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: formData.fullName,
        phone: formData.phone,
        role: 'student',
        batch_id: formData.batchId || null,
      })
      .eq('id', studentId);

    if (profileError) {
      throw profileError;
    }

    // If batch is selected, create enrollment
    if (formData.batchId) {
      const { error: enrollError } = await supabaseAdmin
        .from('enrollments')
        .insert({
          student_id: studentId,
          batch_id: formData.batchId,
          status: 'active',
        });
      
      if (enrollError) {
        throw enrollError;
      }
    }

    revalidatePath('/admin/students');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error creating student:', error);
    const message = error instanceof Error ? error.message : 'শিক্ষার্থী তৈরিতে সমস্যা হয়েছে।';
    return { error: message };
  }
}

// 2. Update Student
export async function updateStudent(studentId: string, formData: {
  fullName: string;
  phone: string;
  batchId?: string;
}) {
  try {
    const supabase = await createClient();
    
    // Verify caller is admin
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller || caller.app_metadata?.role !== 'admin') {
      return { error: 'অননুমোদিত অ্যাক্সেস।' };
    }

    const supabaseAdmin = getAdminClient();

    // Update user metadata in auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(studentId, {
      user_metadata: {
        full_name: formData.fullName,
        phone: formData.phone,
      }
    });

    if (authError) {
      console.warn('Could not update auth metadata:', authError.message);
    }

    // Update profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: formData.fullName,
        phone: formData.phone,
        batch_id: formData.batchId || null,
      })
      .eq('id', studentId);

    if (profileError) {
      throw profileError;
    }

    // Handle batch enrollment change
    if (formData.batchId) {
      // First, check if there's already an enrollment for this batch
      const { data: existingEnrollment } = await supabaseAdmin
        .from('enrollments')
        .select('id, status')
        .eq('student_id', studentId)
        .eq('batch_id', formData.batchId)
        .maybeSingle();

      if (existingEnrollment) {
        // If it exists but is not active, set it to active
        if (existingEnrollment.status !== 'active') {
          await supabaseAdmin
            .from('enrollments')
            .update({ status: 'active' })
            .eq('id', existingEnrollment.id);
        }
      } else {
        // Insert new active enrollment
        await supabaseAdmin
          .from('enrollments')
          .insert({
            student_id: studentId,
            batch_id: formData.batchId,
            status: 'active',
          });
      }

      // Mark all other active enrollments for this student as 'dropped'
      await supabaseAdmin
        .from('enrollments')
        .update({ status: 'dropped' })
        .eq('student_id', studentId)
        .neq('batch_id', formData.batchId)
        .eq('status', 'active');
    } else {
      // No batch selected, so set all active enrollments to 'dropped'
      await supabaseAdmin
        .from('enrollments')
        .update({ status: 'dropped' })
        .eq('student_id', studentId)
        .eq('status', 'active');
    }

    revalidatePath('/admin/students');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating student:', error);
    const message = error instanceof Error ? error.message : 'শিক্ষার্থীর তথ্য পরিবর্তনে সমস্যা হয়েছে।';
    return { error: message };
  }
}

// 3. Delete Student
export async function deleteStudent(studentId: string) {
  try {
    const supabase = await createClient();
    
    // Verify caller is admin
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller || caller.app_metadata?.role !== 'admin') {
      return { error: 'অননুমোদিত অ্যাক্সেস।' };
    }

    const supabaseAdmin = getAdminClient();

    // Delete the user directly via SQL RPC to bypass GoTrue admin API 500 issues
    const { error: deleteError } = await supabaseAdmin.rpc('delete_user_by_admin', {
      p_user_id: studentId
    });

    if (deleteError) {
      throw deleteError;
    }

    revalidatePath('/admin/students');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error deleting student:', error);
    const message = error instanceof Error ? error.message : 'শিক্ষার্থী ডিলিট করতে সমস্যা হয়েছে।';
    return { error: message };
  }
}
