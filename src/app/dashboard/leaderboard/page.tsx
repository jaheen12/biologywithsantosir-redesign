import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Trophy, Award, Calendar, Users, Star } from 'lucide-react';
import { toBengaliNumerals, getBanglaOrdinal } from '@/lib/bangla';

interface LeaderboardEntry {
  student_id: string;
  full_name: string;
  total_marks: number | string;
  exams_count: number | string;
  rank: number;
}

export default async function LeaderboardPage() {
  const supabase = await createClient();

  let user;
  try {
    const { data: userData } = await supabase.auth.getUser();
    user = userData.user;
  } catch {
    user = null;
  }

  if (!user) {
    redirect('/login');
  }

  // Get student's batch_id from profile
  let profile;
  try {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('batch_id')
      .eq('id', user.id)
      .single();
    profile = profileData;
  } catch {
    profile = null;
  }

  if (!profile || !profile.batch_id) {
    return (
      <div className="space-y-6 font-ui max-w-5xl mx-auto pb-12">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <Trophy className="w-7 h-7 text-primary" />
          <span>ব্যাচ র‍্যাংকিং</span>
        </h1>
        <div className="bg-surface border border-border rounded-2xl p-8 text-center text-text-muted shadow-sm">
          আপনি কোনো সক্রিয় ব্যাচে ভর্তি হননি।
        </div>
      </div>
    );
  }

  // Query leaderboard
  let leaderboardData;
  try {
    const { data } = await supabase
      .rpc('get_batch_leaderboard', { p_batch_id: profile.batch_id });
    leaderboardData = data;
  } catch {
    leaderboardData = null;
  }

  const leaderboard = (leaderboardData as unknown as LeaderboardEntry[]) || [];

  // Find current student's entry
  const studentEntry = leaderboard.find((row) => row.student_id === user.id);

  return (
    <div className="space-y-8 font-ui max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <Trophy className="w-7 h-7 text-primary" />
          <span>ব্যাচ র‍্যাংকিং</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          সকল পরীক্ষার মোট নম্বরের ভিত্তিতে ব্যাচের মেধাতালিকা।
        </p>
      </div>

      {/* Empty State */}
      {leaderboard.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center text-text-muted shadow-sm">
          এখনো কোনো পরীক্ষার ফলাফল প্রকাশিত হয়নি — র‍্যাংকিং পরে দেখা যাবে।
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sticky Position Banner */}
          {studentEntry && (
            <div className="bg-primary text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-primary-dark">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                  <Star className="w-5 h-5 fill-white text-white" />
                </div>
                <div>
                  <span className="text-xs text-primary-light/80 block font-medium">মেধাতালিকায় আপনার অবস্থান</span>
                  <span className="text-lg font-bold">
                    আপনার অবস্থান: {getBanglaOrdinal(studentEntry.rank)}
                  </span>
                </div>
              </div>
              <div className="flex gap-6 text-sm font-medium border-t sm:border-t-0 border-white/20 pt-3 sm:pt-0 w-full sm:w-auto justify-around sm:justify-end">
                <div>
                  <span className="text-xs text-primary-light/85 block">মোট প্রাপ্ত নম্বর</span>
                  <span className="text-base font-bold">{toBengaliNumerals(studentEntry.total_marks)}</span>
                </div>
                <div className="border-l border-white/25 pl-6">
                  <span className="text-xs text-primary-light/85 block">অংশগ্রহণকৃত পরীক্ষা</span>
                  <span className="text-base font-bold">{toBengaliNumerals(studentEntry.exams_count)}টি</span>
                </div>
              </div>
            </div>
          )}

          {/* Rankings Table */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
              <table className="w-full text-left border-collapse text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted uppercase font-medium bg-surface-alt/40">
                    <th className="px-6 py-4 w-24">র‍্যাংক</th>
                    <th className="px-6 py-4">নাম</th>
                    <th className="px-6 py-4">মোট প্রাপ্ত নম্বর</th>
                    <th className="px-6 py-4 text-right">পরীক্ষা সংখ্যা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leaderboard.map((row) => {
                    const isSelf = row.student_id === user.id;
                    const rankText = toBengaliNumerals(row.rank);

                    // Trophies for Top 3
                    let rankDisplay = <span>{rankText}</span>;
                    if (row.rank === 1) rankDisplay = <span className="text-lg" title="First Place">🥇</span>;
                    else if (row.rank === 2) rankDisplay = <span className="text-lg" title="Second Place">🥈</span>;
                    else if (row.rank === 3) rankDisplay = <span className="text-lg" title="Third Place">🥉</span>;

                    return (
                      <tr
                        key={row.student_id}
                        className={`transition-colors ${
                          isSelf
                            ? 'bg-primary-light/40 font-semibold border-l-4 border-primary hover:bg-primary-light/60'
                            : 'hover:bg-surface-alt/30'
                        }`}
                      >
                        {/* Rank */}
                        <td className="px-6 py-4.5 font-bold text-text-primary">
                          <div className="flex items-center gap-2">
                            {row.rank <= 3 ? rankDisplay : <span>{getBanglaOrdinal(row.rank)}</span>}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-6 py-4.5 text-text-primary">
                          <div className="flex items-center gap-2">
                            <span>{row.full_name}</span>
                            {isSelf && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary text-white uppercase">
                                আপনি
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total Marks */}
                        <td className="px-6 py-4.5 font-semibold text-text-primary text-base">
                          {toBengaliNumerals(row.total_marks)}
                        </td>

                        {/* Exams Count */}
                        <td className="px-6 py-4.5 text-text-secondary text-right font-medium">
                          {toBengaliNumerals(row.exams_count)}টি
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Mobile scroll hint */}
              <p className="text-xs text-text-muted text-right md:hidden mt-1">&#8592; স্ক্রোল করুন &#8594;</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
