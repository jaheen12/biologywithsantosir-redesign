import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  AlertCircle, 
  Calendar, 
  BookOpen, 
  Trophy, 
  Bell, 
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
  Laptop
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/ui/Container';
import { toBengaliNumerals } from '@/lib/bangla';

const dayTranslations: Record<string, string> = {
  'Saturday': 'শনিবার',
  'Sunday': 'রবিবার',
  'Monday': 'সোমবার',
  'Tuesday': 'মঙ্গলবার',
  'Wednesday': 'বুধবার',
  'Thursday': 'বৃহস্পতিবার',
  'Friday': 'শুক্রবার'
};

const dayMapping: Record<string, number> = {
  'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
};

// Helper to find the next upcoming class slot
function getNextClass(routines: any[]) {
  if (!routines || routines.length === 0) return null;

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, ..., 6 = Saturday
  const currentTimeString = now.toTimeString().split(' ')[0]; // "HH:MM:SS"

  // Sort routines based on how many days away they are
  const sortedRoutines = [...routines].sort((a, b) => {
    let diffA = (dayMapping[a.day_of_week] - currentDay + 7) % 7;
    let diffB = (dayMapping[b.day_of_week] - currentDay + 7) % 7;

    // If a routine is today, check if it's already finished
    if (diffA === 0 && a.start_time < currentTimeString) {
      diffA = 7;
    }
    if (diffB === 0 && b.start_time < currentTimeString) {
      diffB = 7;
    }

    if (diffA !== diffB) {
      return diffA - diffB;
    }

    return a.start_time.localeCompare(b.start_time);
  });

  return sortedRoutines[0];
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // 2. Fetch payment due status
  const { data: paymentDue } = await supabase
    .from('payment_due')
    .select('*')
    .eq('student_id', user.id)
    .single();

  const isEnrolled = !!profile.batch_id;

  // Let's declare placeholders for queries that depend on active enrollment
  let batchName = 'কোনো ব্যাচ নেই';
  let nextClass = null;
  let nextExam = null;
  let latestResult = null;
  let announcements: any[] = [];

  if (isEnrolled) {
    // Fetch batch details
    const { data: batch } = await supabase
      .from('batches')
      .select('name')
      .eq('id', profile.batch_id)
      .single();
    if (batch) batchName = batch.name;

    // Fetch routines for upcoming class
    const { data: routines } = await supabase
      .from('routines')
      .select('*')
      .eq('batch_id', profile.batch_id);
    nextClass = getNextClass(routines || []);

    // Fetch next upcoming exam
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: exams } = await supabase
      .from('exams')
      .select('*')
      .eq('batch_id', profile.batch_id)
      .gte('exam_date', todayStr)
      .order('exam_date', { ascending: true })
      .limit(1);
    if (exams && exams.length > 0) {
      nextExam = exams[0];
    }

    // Fetch latest exam result
    const { data: results } = await supabase
      .from('results')
      .select('*, exams!inner(*)')
      .eq('student_id', user.id);
    
    if (results && results.length > 0) {
      const sortedResults = [...results].sort((a: any, b: any) => 
        new Date(b.exams.exam_date).getTime() - new Date(a.exams.exam_date).getTime()
      );
      latestResult = sortedResults[0];
    }

    // Fetch announcements
    const { data: announcementsData } = await supabase
      .from('announcements')
      .select('*')
      .or(`batch_id.eq.${profile.batch_id},batch_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(3);
    announcements = announcementsData || [];
  }

  return (
    <div className="space-y-6 font-ui">
      {/* Payment Banner */}
      {isEnrolled && paymentDue && paymentDue.status !== 'paid' && (
        <div 
          className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
            paymentDue.status === 'overdue' 
              ? 'bg-error/10 border-error/20 text-error' 
              : 'bg-accent/10 border-accent/20 text-text-primary'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 sm:mt-0 ${paymentDue.status === 'overdue' ? 'text-error' : 'text-accent'}`} />
            <p className="text-sm font-medium">
              {paymentDue.status === 'overdue' 
                ? `⚠️ এই মাসের বেতন বকেয়া আছে (৳${toBengaliNumerals(paymentDue.monthly_fee)})` 
                : `এই মাসের আংশিক পেমেন্ট হয়েছে। বকেয়া: ৳${toBengaliNumerals(paymentDue.outstanding)}`}
            </p>
          </div>
          <Link 
            href="/dashboard/payments" 
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition duration-150 shrink-0 w-fit ${
              paymentDue.status === 'overdue'
                ? 'bg-error text-white hover:bg-error-dark'
                : 'bg-accent text-white hover:bg-accent/90'
            }`}
          >
            পেমেন্ট বিবরণ দেখুন
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Welcome Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary-mid text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="relative z-10 space-y-2">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            স্টুডেন্ট ড্যাশবোর্ড
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-ui">স্বাগতম, {profile.full_name}!</h2>
          <p className="text-white/80 text-sm sm:text-base font-ui">
            ব্যাচ: <span className="font-semibold text-white">{batchName}</span>
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 pointer-events-none">
          <BookOpen className="w-64 h-64" />
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Class Card */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">পরবর্তী ক্লাস</span>
              <div className="p-2 bg-primary-light text-primary rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            {nextClass ? (
              <div className="space-y-2">
                <h4 className="font-semibold text-text-primary text-base leading-snug">{nextClass.subject}</h4>
                <div className="flex flex-col gap-1 text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-text-muted" />
                    <span>{dayTranslations[nextClass.day_of_week] || nextClass.day_of_week} • {toBengaliNumerals(nextClass.start_time.slice(0, 5))} - {toBengaliNumerals(nextClass.end_time.slice(0, 5))}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {nextClass.platform === 'Physical' ? (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-text-muted" />
                        <span>সরাসরি কোচিং সেন্টার</span>
                      </>
                    ) : (
                      <>
                        <Laptop className="w-3.5 h-3.5 text-text-muted" />
                        <span>অনলাইন ({nextClass.platform})</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">আজ কোনো ক্লাস নেই</p>
            )}
          </div>
          {nextClass && nextClass.link && (
            <a 
              href={nextClass.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition duration-150"
            >
              ক্লাসে যোগ দিন
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Next Exam Card */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">পরবর্তী পরীক্ষা</span>
              <div className="p-2 bg-accent-light text-accent rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            {nextExam ? (
              <div className="space-y-2">
                <h4 className="font-semibold text-text-primary text-base leading-snug">{nextExam.title}</h4>
                <div className="flex flex-col gap-1 text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-text-muted" />
                    <span>তারিখ: {new Date(nextExam.exam_date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-text-muted" />
                    <span>পূর্ণমান: {toBengaliNumerals(nextExam.total_marks)} ({nextExam.type === 'mcq' ? 'MCQ' : nextExam.type === 'written' ? 'লিখিত' : 'মক'})</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">কোনো পরীক্ষা নির্ধারিত নেই</p>
            )}
          </div>
          {nextExam && (
            <Link 
              href="/dashboard/exams"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition duration-150"
            >
              বিস্তারিত দেখুন
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Latest Result Card */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">সর্বশেষ ফলাফল</span>
              <div className="p-2 bg-primary-light text-primary rounded-xl">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
            {latestResult ? (
              <div className="space-y-2">
                <h4 className="font-semibold text-text-primary text-base leading-snug">{latestResult.exams.title}</h4>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-primary font-ui">{toBengaliNumerals(latestResult.marks_obtained)} <span className="text-xs text-text-secondary">/ {toBengaliNumerals(latestResult.exams.total_marks)}</span></div>
                    <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-lg bg-primary-light text-primary">{latestResult.grade}</span>
                  </div>
                {latestResult.remarks && (
                  <p className="text-xs text-text-secondary truncate">মন্তব্য: {latestResult.remarks}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">এখনো কোনো পরীক্ষা হয়নি</p>
            )}
          </div>
          {latestResult && (
            <Link 
              href="/dashboard/results"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition duration-150"
            >
              সব ফলাফল দেখুন
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Notice Board Section */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          নোটিশ বোর্ড
        </h3>
        
        {announcements.length > 0 ? (
          <div className="divide-y divide-border">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-semibold text-text-primary text-base font-ui">{announcement.title}</h4>
                  <span className="text-xs text-text-muted shrink-0">
                    {new Date(announcement.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed font-ui">
                  {announcement.body.length > 180 ? `${announcement.body.slice(0, 180)}...` : announcement.body}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary py-2">কোনো নোটিশ নেই</p>
        )}
      </div>
    </div>
  );
}
