import React from 'react';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const PaymentsClient = dynamic(() => import('@/components/admin/PaymentsClient'), {
  loading: () => <div className="animate-pulse h-96 bg-surface-secondary rounded-xl" />,
});

interface PaymentDetail {
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
  profiles: {
    full_name: string;
    phone: string | null;
  } | null;
  batches: {
    name: string;
    fee: number;
  } | null;
}

interface DueStudent {
  student_id: string;
  full_name: string;
  phone: string | null;
  batch_id: string;
  batch_name: string;
  monthly_fee: number;
  due_month: string;
  paid_this_month: number;
  outstanding: number;
  status: 'overdue' | 'partial';
}

interface BatchItem {
  id: string;
  name: string;
}

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // 1. Fetch all payments
  const { data: paymentsRaw } = await supabase
    .from('payments')
    .select('*, profiles(full_name, phone), batches(name, fee)')
    .order('created_at', { ascending: false });

  const payments = (paymentsRaw as unknown as PaymentDetail[]) || [];

  // 2. Fetch due/overdue students
  const { data: dueStudentsRaw } = await supabase
    .from('payment_due')
    .select('*')
    .in('status', ['overdue', 'partial'])
    .order('status');

  const dueStudents = (dueStudentsRaw as unknown as DueStudent[]) || [];

  // 3. Fetch batches for dropdown filter
  const { data: batchesRaw } = await supabase
    .from('batches')
    .select('id, name')
    .order('name');

  const batches = (batchesRaw as unknown as BatchItem[]) || [];

  return (
    <div className="space-y-8 font-ui">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">পেমেন্ট লেজার</h1>
          <p className="text-text-secondary text-sm mt-1">
            পেমেন্টের বিবরণী এবং বকেয়া বেতনের হিসাব পরিচালনা করুন।
          </p>
        </div>
      </div>

      <PaymentsClient initialPayments={payments} initialDueStudents={dueStudents} batches={batches} />
    </div>
  );
}
