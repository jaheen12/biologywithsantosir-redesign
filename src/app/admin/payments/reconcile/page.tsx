import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ReconcileClient from '@/components/admin/ReconcileClient';

interface PendingPayment {
  id: string;
  student_id: string;
  batch_id: string;
  amount: number;
  month: string;
  paid_on: string;
  method: string;
  is_installment: boolean;
  installment_number: number | null;
  transaction_id: string | null;
  reconciled: boolean;
  note: string | null;
  receipt_number: string;
  created_at: string;
  student: {
    full_name: string;
    phone: string | null;
  } | null;
  recorder: {
    full_name: string;
  } | null;
}

export default async function AdminReconcilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch pending (unreconciled) mobile payments (bKash/Nagad) sorted by oldest first
  const { data: pendingRaw } = await supabase
    .from('payments')
    .select('*, student:profiles!student_id(full_name, phone), recorder:profiles!recorded_by(full_name)')
    .eq('reconciled', false)
    .in('method', ['bKash', 'Nagad'])
    .order('created_at', { ascending: true });

  const pending = (pendingRaw as unknown as PendingPayment[]) || [];

  return (
    <div className="space-y-8 font-ui">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">মোবাইল ব্যাংকিং পেমেন্ট যাচাই</h1>
        <p className="text-text-secondary text-sm mt-1">
          শিক্ষার্থীদের পাঠানো bKash এবং Nagad পেমেন্টের TrxID এবং পরিমাণের সত্যতা যাচাই করুন।
        </p>
      </div>

      <ReconcileClient 
        pendingPayments={pending} 
        currentAdminId={user.id} 
      />
    </div>
  );
}
