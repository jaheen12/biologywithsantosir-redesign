'use client';

import React, { useState, useEffect } from 'react';
import { Award, RefreshCw, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import MCQFilters, { Topic } from '@/components/mcq/MCQFilters';
import MCQCard, { MCQ } from '@/components/mcq/MCQCard';
import MCQResult from '@/components/mcq/MCQResult';
import MCQProgress from '@/components/mcq/MCQProgress';

type QuizState = 'idle' | 'loading' | 'quiz' | 'answered' | 'complete';

export default function MCQClient() {
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  
  // Filter states
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [loadingTopics, setLoadingTopics] = useState(true);

  // Quiz progression states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'a' | 'b' | 'c' | 'd' | null>(null);
  const [answers, setAnswers] = useState<Record<number, 'a' | 'b' | 'c' | 'd'>>({});
  const [score, setScore] = useState(0);

  const supabase = createClient();

  // Load topics list on mount
  useEffect(() => {
    async function loadTopics() {
      try {
        const { data, error } = await supabase
          .from('topics')
          .select('id, name_en, name_bn, slug')
          .order('sort_order', { ascending: true });
        
        if (!error && data) {
          setTopics(data);
        }
      } catch (err) {
        console.error('Error loading topics:', err);
      } finally {
        setLoadingTopics(false);
      }
    }
    loadTopics();
  }, []);

  // Fetch MCQs matching the active filters
  const startQuiz = async () => {
    setQuizState('loading');
    setCurrentIdx(0);
    setSelectedOption(null);
    setAnswers({});
    setScore(0);

    try {
      let query = supabase.from('mcqs').select('*');
      
      if (selectedLevel !== 'all') {
        query = query.eq('level', selectedLevel);
      }
      if (selectedTopic !== 'all') {
        query = query.eq('topic_id', selectedTopic);
      }

      // Fetch max 20 questions
      const { data, error } = await query.order('created_at').limit(20);

      if (!error && data) {
        setMcqs(data as MCQ[]);
        if (data.length > 0) {
          setQuizState('quiz');
        } else {
          setQuizState('idle');
        }
      } else {
        setQuizState('idle');
      }
    } catch (err) {
      console.error('Error fetching MCQs:', err);
      setQuizState('idle');
    }
  };

  // Re-fetch automatically when filters change
  useEffect(() => {
    if (quizState !== 'idle' && quizState !== 'loading') {
      startQuiz();
    }
  }, [selectedTopic, selectedLevel]);

  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    
    const currentQuestion = mcqs[currentIdx];
    const isCorrect = selectedOption === currentQuestion.correct_option;
    
    setAnswers(prev => ({ ...prev, [currentIdx]: selectedOption }));
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setQuizState('answered');
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    if (currentIdx + 1 < mcqs.length) {
      setCurrentIdx(prev => prev + 1);
      setQuizState('quiz');
    } else {
      setQuizState('complete');
    }
  };

  const currentMcq = mcqs[currentIdx];

  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui animate-fade-in">
      <Container className="max-w-3xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <span className="text-[0.75rem] font-bold text-primary uppercase tracking-wider bg-primary-light px-2.5 py-1 rounded-md mb-3 inline-block">
            অনুশীলন কেন্দ্র
          </span>
          <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-text-primary leading-tight mb-2">
            MCQ প্র্যাকটিস ইঞ্জিন
          </h1>
          <p className="text-[0.9375rem] text-text-secondary leading-relaxed max-w-lg mx-auto">
            SSC, HSC এবং অনার্স লেভেলের জীববিজ্ঞান বিষয়ের অধ্যায়ভিত্তিক বহুনির্বাচনী প্রশ্ন অনুশীলন করুন।
          </p>
        </div>

        {/* Filter Panel */}
        <div className="mb-8">
          {loadingTopics ? (
            <div className="bg-surface border border-border p-5 rounded-xl flex items-center justify-center gap-2 animate-pulse min-h-[104px]">
              <Loader2 size={18} className="text-primary animate-spin" />
              <span className="text-[0.875rem] text-text-secondary">ফিল্টার লোড হচ্ছে...</span>
            </div>
          ) : (
            <MCQFilters
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              topics={topics}
            />
          )}
        </div>

        {/* Main Quiz Section */}
        {quizState === 'idle' && (
          <div className="bg-surface-alt border border-border rounded-xl p-10 text-center flex flex-col items-center gap-5">
            {mcqs.length === 0 && !loadingTopics ? (
              <div className="max-w-md flex flex-col items-center gap-3">
                <AlertCircle className="w-12 h-12 text-primary/45" />
                <h3 className="text-[1.125rem] font-bold text-text-primary">কোনো প্রশ্ন পাওয়া যায়নি</h3>
                <p className="text-[0.875rem] text-text-secondary leading-relaxed">
                  এই লেভেলে বা বিষয়টির অধীনে এখনও কোনো প্রশ্ন যোগ করা হয়নি। অনুগ্রহ করে অন্য কোনো ফিল্টার নির্বাচন করুন।
                </p>
              </div>
            ) : (
              <div className="max-w-md flex flex-col items-center gap-3">
                <Award className="w-12 h-12 text-primary/45" />
                <h3 className="text-[1.125rem] font-bold text-text-primary">অনুশীলন শুরু করো</h3>
                <p className="text-[0.875rem] text-text-secondary leading-relaxed">
                  আপনার নির্বাচিত ফিল্টার অনুযায়ী প্রশ্ন প্রস্তুত রয়েছে। অনুশীলনের মাধ্যমে নিজের প্রস্তুতি যাচাই করুন।
                </p>
              </div>
            )}
            <Button onClick={startQuiz} className="px-8 min-h-[48px] gap-2 flex items-center justify-center text-[0.9375rem]">
              <PlayCircle size={18} /> শুরু করুন (Start Quiz)
            </Button>
          </div>
        )}

        {quizState === 'loading' && (
          <div className="bg-surface border border-border rounded-xl p-16 text-center flex flex-col items-center gap-4">
            <Loader2 size={36} className="text-primary animate-spin" />
            <p className="text-[0.9375rem] text-text-secondary font-semibold">প্রশ্ন তৈরি হচ্ছে, একটু অপেক্ষা করুন...</p>
          </div>
        )}

        {(quizState === 'quiz' || quizState === 'answered') && currentMcq && (
          <div className="flex flex-col gap-6">
            {/* Progress Bar */}
            <MCQProgress current={currentIdx + 1} total={mcqs.length} />

            {/* Question Card */}
            <MCQCard
              mcq={currentMcq}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              onSubmit={handleSubmitAnswer}
              isAnswered={quizState === 'answered'}
            />

            {/* Result Explanation Card */}
            {quizState === 'answered' && (
              <MCQResult
                correctOption={currentMcq.correct_option}
                selectedOption={answers[currentIdx] || ''}
                explanation={currentMcq.explanation}
                onNext={handleNextQuestion}
                isLast={currentIdx + 1 === mcqs.length}
                mcqOptions={{
                  a: currentMcq.option_a,
                  b: currentMcq.option_b,
                  c: currentMcq.option_c,
                  d: currentMcq.option_d,
                }}
              />
            )}
          </div>
        )}

        {quizState === 'complete' && (
          <div className="bg-surface border border-border rounded-xl p-8 text-center flex flex-col items-center gap-6 animate-fade-in shadow-sm">
            <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center text-primary mb-2">
              <Award size={40} />
            </div>

            <div>
              <h2 className="text-[1.5rem] font-bold text-text-primary">অনুশীলন সম্পন্ন হয়েছে!</h2>
              <p className="text-[0.9375rem] text-text-secondary mt-1 max-w-sm mx-auto">
                আপনি সফলভাবে সবকটি প্রশ্নের উত্তর দিয়েছেন। আপনার অনুশীলনের ফলাফল:
              </p>
            </div>

            {/* Score Ring indicator */}
            <div className="relative w-36 h-36 rounded-full border-[10px] border-primary-light flex flex-col items-center justify-center">
              <span className="text-[2rem] font-bold text-primary">
                {score} / {mcqs.length}
              </span>
              <span className="text-[0.75rem] font-bold text-text-secondary uppercase tracking-wider">
                প্রাপ্ত নম্বর
              </span>
            </div>

            {/* Performance Stats */}
            <div className="w-full max-w-sm grid grid-cols-2 gap-4 border-t border-b border-border py-5 text-[0.875rem] font-ui">
              <div className="text-center border-r border-border">
                <span className="text-text-secondary block">সঠিক উত্তর</span>
                <span className="text-[1.25rem] font-bold text-primary">{score}টি</span>
              </div>
              <div className="text-center">
                <span className="text-text-secondary block">ভুল উত্তর</span>
                <span className="text-[1.25rem] font-bold text-error">{mcqs.length - score}টি</span>
              </div>
            </div>

            {/* Restart Button */}
            <Button onClick={startQuiz} className="px-8 gap-2 min-h-[48px]">
              <RefreshCw size={18} /> পুনরায় শুরু করুন (Restart Quiz)
            </Button>
          </div>
        )}
      </Container>
    </main>
  );
}
