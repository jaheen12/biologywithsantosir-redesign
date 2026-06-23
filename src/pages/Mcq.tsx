import React, { useState, useEffect } from 'react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useMCQs } from '../hooks/useMCQs';
import { HelpCircle, ChevronRight, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';

const Mcq: React.FC = () => {
  const [topicFilter, setTopicFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Fetch MCQs based on filters
  const { mcqs, loading, error } = useMCQs(topicFilter, levelFilter);

  // Reset quiz when filters change or when data changes
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  }, [topicFilter, levelFilter, mcqs.length]);

  const topics = [
    { label: 'সব বিষয়', value: 'all' },
    { label: 'জেনেটিক্স', value: 'genetics' },
    { label: 'কোষ জীববিজ্ঞান', value: 'cell-biology' },
    { label: 'শারীরবৃত্ত', value: 'physiology' },
    { label: 'অণুজীববিজ্ঞান', value: 'microbiology' },
  ];

  const levels = [
    { label: 'সব লেভেল', value: 'all' },
    { label: 'এসএসসি (SSC)', value: 'ssc' },
    { label: 'এইচএসসি (HSC)', value: 'hsc' },
    { label: 'অনার্স (Honours)', value: 'honours' },
  ];

  const handleOptionSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null || isSubmitted) return;
    
    setIsSubmitted(true);
    const currentQuestion = mcqs[currentIndex];
    if (selectedOption === currentQuestion.correct_option_index) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    
    if (currentIndex + 1 < mcqs.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  const completedProgressPercentage = mcqs.length > 0 ? ((currentIndex + (isSubmitted ? 1 : 0)) / mcqs.length) * 100 : 0;

  return (
    <Container className="py-12 font-sans max-w-4xl">
      {/* Page Header */}
      <div className="border-b border-border pb-8 mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-3">
          MCQ অনুশীলন (MCQ Practice)
        </h1>
        <p className="text-text-secondary text-base leading-relaxed">
          এসএসসি, এইচএসসি এবং অনার্স পর্যায়ের জীববিজ্ঞানের গুরুত্বপূর্ণ কুইজসমূহ অনুশীলন করো এবং সঠিক ব্যাখ্যার মাধ্যমে বুঝে শেখো।
        </p>
      </div>

      {/* Filter Bars */}
      <div className="flex flex-col gap-4 mb-8 bg-surface-alt border border-border p-6 rounded-2xl shadow-xs">
        <div>
          <span className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wider">টপিক সিলেক্ট করুন:</span>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <button
                key={t.value}
                onClick={() => setTopicFilter(t.value)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                  topicFilter === t.value
                    ? 'bg-primary border-primary text-white shadow-xs'
                    : 'border-border bg-surface text-text-secondary hover:bg-primary-light hover:text-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wider">লেভেল সিলেক্ট করুন:</span>
          <div className="flex flex-wrap gap-2">
            {levels.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevelFilter(l.value)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                  levelFilter === l.value
                    ? 'bg-primary border-primary text-white shadow-xs'
                    : 'border-border bg-surface text-text-secondary hover:bg-primary-light hover:text-primary'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz Area */}
      {loading ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-sm animate-pulse">
          <HelpCircle className="text-primary-mid/40 mx-auto mb-4 animate-spin" size={40} aria-hidden="true" />
          <p className="text-text-secondary text-base font-semibold">প্রশ্নসমূহ লোড করা হচ্ছে...</p>
        </div>
      ) : error ? (
        <div className="bg-error/5 border border-error/20 rounded-2xl p-8 text-center text-error shadow-sm">
          <p className="font-bold text-lg mb-2">প্রশ্ন লোড করা যায়নি</p>
          <p className="text-sm mb-4">{error}</p>
          <Button onClick={handleRestart}>পুনরায় চেষ্টা করুন</Button>
        </div>
      ) : mcqs.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-xs">
          <HelpCircle className="text-text-muted mx-auto mb-4" size={40} aria-hidden="true" />
          <p className="text-text-primary text-lg font-bold mb-2">কোন প্রশ্ন পাওয়া যায়নি</p>
          <p className="text-text-secondary text-sm max-w-sm mx-auto">
            আপনার সিলেক্ট করা ফিল্টারের অধীনে কোন কুইজ ডেটাবেজে নেই। অনুগ্রহ করে অন্য কোনো ফিল্টার ট্রাই করুন।
          </p>
        </div>
      ) : quizFinished ? (
        // Quiz Finished Screen
        <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 text-center shadow-sm relative overflow-hidden">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-primary" size={44} aria-hidden="true" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">কুইজ সম্পন্ন হয়েছে!</h2>
          <p className="text-text-secondary text-base mb-6">
            আপনি {mcqs.length} টি প্রশ্নের মধ্যে মোট {score} টি সঠিক উত্তর দিয়েছেন।
          </p>

          <div className="inline-block bg-primary-light border border-primary/10 rounded-xl px-6 py-4 mb-8">
            <span className="block text-sm text-primary font-bold uppercase tracking-wider mb-1">আপনার স্কোর</span>
            <span className="text-3xl font-extrabold text-primary font-sans leading-none">
              {Math.round((score / mcqs.length) * 100)}%
            </span>
          </div>

          <div className="flex justify-center">
            <Button size="lg" onClick={handleRestart} className="gap-2">
              <RotateCcw size={18} aria-hidden="true" />
              আবার শুরু করুন
            </Button>
          </div>
        </div>
      ) : (
        // Question Screen
        <div className="bg-surface border border-border rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-6 md:p-8">
            {/* Header: Question Progress & Level Badge */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-border/50">
              <span className="text-sm font-semibold text-text-muted">
                প্রশ্ন {currentIndex + 1} / {mcqs.length}
              </span>
              <div className="flex gap-2">
                <Badge variant={mcqs[currentIndex].academic_level}>{mcqs[currentIndex].academic_level}</Badge>
                <Badge variant="default" className="bg-surface-alt border border-border text-text-secondary capitalize">
                  {mcqs[currentIndex].topic_id.replace('-', ' ')}
                </Badge>
              </div>
            </div>

            {/* Question Text */}
            <h3 className="text-lg md:text-xl font-bold text-text-primary mb-6 leading-relaxed">
              {mcqs[currentIndex].question}
            </h3>

            {/* Options List */}
            <div className="grid gap-3 mb-6">
              {mcqs[currentIndex].options.map((option, i) => {
                let buttonStyle = 'border-border bg-surface text-text-primary hover:bg-surface-alt';
                let icon = null;

                if (isSubmitted) {
                  const isCorrect = i === mcqs[currentIndex].correct_option_index;
                  const isSelected = i === selectedOption;

                  if (isCorrect) {
                    buttonStyle = 'border-primary-mid bg-[#EBFBEE] text-primary hover:bg-[#EBFBEE]';
                    icon = <CheckCircle2 className="text-primary-mid shrink-0" size={20} aria-hidden="true" />;
                  } else if (isSelected) {
                    buttonStyle = 'border-error bg-[#FDF2F2] text-error hover:bg-[#FDF2F2]';
                    icon = <XCircle className="text-error shrink-0" size={20} aria-hidden="true" />;
                  } else {
                    buttonStyle = 'border-border bg-surface/50 text-text-muted opacity-60';
                  }
                } else if (selectedOption === i) {
                  buttonStyle = 'border-primary bg-primary-light text-primary hover:bg-primary-light/80';
                }

                return (
                  <button
                    key={i}
                    disabled={isSubmitted}
                    onClick={() => handleOptionSelect(i)}
                    className={`flex items-center justify-between gap-4 p-4 rounded-xl border text-left text-base font-medium transition-all cursor-pointer disabled:cursor-default w-full ${buttonStyle}`}
                  >
                    <span className="flex gap-3 items-center">
                      <span className="flex items-center justify-center shrink-0 w-7 h-7 rounded-full border border-current text-sm font-bold font-sans">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{option}</span>
                    </span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {isSubmitted && mcqs[currentIndex].explanation && (
              <div className="bg-[#FFF8E8] border-l-4 border-accent rounded-r-xl p-5 my-6">
                <h4 className="text-xs uppercase tracking-wider font-bold text-accent mb-2 font-sans">
                  💡 উত্তর ব্যাখ্যা
                </h4>
                <p className="text-text-secondary text-base leading-relaxed">
                  {mcqs[currentIndex].explanation}
                </p>
              </div>
            )}
          </div>

          {/* Footer Controls & Progress Bar */}
          <div className="border-t border-border bg-surface-alt p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm font-medium text-text-secondary">
              {!isSubmitted ? (
                <span>অপশন সিলেক্ট করে সাবমিট করুন</span>
              ) : selectedOption === mcqs[currentIndex].correct_option_index ? (
                <span className="text-primary-mid font-bold flex items-center gap-1">
                  🎉 চমৎকার! সঠিক উত্তর।
                </span>
              ) : (
                <span className="text-error font-bold flex items-center gap-1">
                  ❌ দুঃখিত, ভুল উত্তর।
                </span>
              )}
            </div>

            <div>
              {!isSubmitted ? (
                <Button 
                  disabled={selectedOption === null}
                  onClick={handleSubmit}
                  className="w-full sm:w-auto"
                >
                  উত্তর জমা দিন
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  className="w-full sm:w-auto gap-1"
                >
                  {currentIndex + 1 < mcqs.length ? 'পরবর্তী প্রশ্ন' : 'কুইজ শেষ করুন'}
                  <ChevronRight size={16} aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full h-1.5 bg-border relative">
            <div 
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
              style={{ width: `${completedProgressPercentage}%` }}
              role="progressbar"
              aria-valuenow={completedProgressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default Mcq;
