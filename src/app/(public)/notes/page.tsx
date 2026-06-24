import { Metadata } from 'next';
import { supabasePublic as supabase } from '@/lib/supabase/public';
import { Container } from '@/components/ui/Container';
import NotesClient from '@/components/notes/NotesClient';

export const metadata: Metadata = {
  title: 'নোটস ও PDF ডাউনলোড | BiologywithSantosir',
  description: 'সান্তো স্যারের গুরুত্বপূর্ণ লেকচার শিট, হ্যান্ডনোট এবং জীববিজ্ঞানের সাজেশন্স বিনামূল্যে পিডিএফ ফাইল হিসেবে ডাউনলোড করুন।',
};

export const revalidate = 3600; // Cache for 1 hour

export default async function NotesPage() {
  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container>
        {/* Page Header */}
        <div className="mb-10 text-center md:text-left max-w-3xl">
          <span className="text-[0.75rem] font-bold text-primary uppercase tracking-wider bg-primary-light px-2.5 py-1 rounded-md mb-3 inline-block">
            নোটস লাইব্রেরি
          </span>
          <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-text-primary leading-tight mb-2">
            নোটস ও PDF ডাউনলোড
          </h1>
          <p className="text-[1rem] text-text-secondary leading-relaxed">
            সান্তো স্যারের ক্লাসের গুরুত্বপূর্ণ লেকচার শিট, হ্যান্ডনোট এবং জীববিজ্ঞানের সাজেশন্স বিনামূল্যে পিডিএফ ফাইল হিসেবে ডাউনলোড করুন।
          </p>
        </div>

        {/* Client side filter and grid */}
        <NotesClient initialNotes={notes || []} />
      </Container>
    </main>
  );
}
