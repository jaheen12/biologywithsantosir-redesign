import React, { useState } from 'react';
import Container from '../components/ui/Container';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useNotes, trackDownload } from '../hooks/useNotes';
import { FileText, Download, Share2, HelpCircle } from 'lucide-react';
import SEO from '../components/SEO';

const Notes: React.FC = () => {
  const [levelFilter, setLevelFilter] = useState<'all' | 'ssc' | 'hsc' | 'honours'>('all');
  const { notes, loading, error } = useNotes(levelFilter);

  const filters: { label: string; value: typeof levelFilter }[] = [
    { label: 'সব লেভেল', value: 'all' },
    { label: 'এসএসসি (SSC)', value: 'ssc' },
    { label: 'এইচএসসি (HSC)', value: 'hsc' },
    { label: 'অনার্স (Honours)', value: 'honours' },
  ];

  const handleDownload = async (noteId: string, filename: string, currentCount: number) => {
    const projectRef = 'nlciqqwwquniblwuouiq';
    const publicUrl = `https://${projectRef}.supabase.co/storage/v1/object/public/pdfs/${filename}`;
    window.open(publicUrl, '_blank');
    await trackDownload(noteId, currentCount);
  };

  return (
    <>
      <SEO 
        title="ফ্রি পিডিএফ নোটস ডাউনলোড" 
        description="এসএসসি, এইচএসসি এবং বিশ্ববিদ্যালয় অনার্স জীববিজ্ঞানের গুরুত্বপূর্ণ চিত্রসমূহ, অধ্যায়ভিত্তিক হ্যান্ডনোট এবং লেকচার শিটের ফ্রি পিডিএফ সংস্করণ ডাউনলোড করুন।" 
      />
      <Container className="py-12 font-sans">
      {/* Page Header */}
      <div className="border-b border-border pb-8 mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-3">
          ফ্রি পিডিএফ নোটস (Free PDF Notes)
        </h1>
        <p className="text-text-secondary text-base max-w-3xl leading-relaxed">
          এসএসসি, এইচএসসি এবং বিশ্ববিদ্যালয় অনার্স জীববিজ্ঞানের গুরুত্বপূর্ণ চিত্রসমূহ, অধ্যায়ভিত্তিক হ্যান্ডনোট এবং লেকচার শিটের ফ্রি পিডিএফ সংস্করণ ডাউনলোড করুন।
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setLevelFilter(filter.value)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
              levelFilter === filter.value
                ? 'bg-primary border-primary text-white shadow-xs'
                : 'border-border bg-transparent text-text-secondary hover:bg-surface-alt hover:text-text-primary'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="border border-border rounded-2xl p-6 animate-pulse bg-surface-alt flex gap-4 h-36">
              <div className="w-12 h-12 bg-border rounded-lg shrink-0"></div>
              <div className="flex-grow space-y-3">
                <div className="h-4 bg-border rounded-sm w-1/4"></div>
                <div className="h-6 bg-border rounded-sm w-3/4"></div>
                <div className="h-4 bg-border rounded-sm w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center border border-error/20 bg-error/5 text-error rounded-xl max-w-md mx-auto">
          <p className="font-bold text-lg mb-2">নোটস লোড করা যায়নি</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="p-12 text-center text-text-secondary border border-dashed border-border rounded-2xl max-w-lg mx-auto">
          <HelpCircle className="text-text-muted mx-auto mb-4" size={40} aria-hidden="true" />
          <p className="text-text-primary text-lg font-bold mb-2">কোন পিডিএফ নোট পাওয়া যায়নি</p>
          <p className="text-sm">এই ক্যাটাগরির অধীনে বর্তমানে কোন ক্লাস নোট বা শিট আপলোড করা নেই।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notes.map((note) => (
            <div 
              key={note.id} 
              className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/45 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex gap-4 items-start mb-4">
                <div className="p-3 bg-primary-light text-primary rounded-xl shrink-0">
                  <FileText size={28} aria-hidden="true" />
                </div>
                <div>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <Badge variant={note.academic_level}>{note.academic_level}</Badge>
                    <Badge variant="default" className="bg-surface-alt border border-border text-text-secondary capitalize">
                      {note.subject}
                    </Badge>
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-text-primary mb-1 line-clamp-2">
                    {note.title}
                  </h3>
                  <div className="text-xs text-text-muted font-medium font-sans">
                    Size: {note.size_mb} MB • {note.download_count} downloads
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-border/50 pt-4">
                <Button 
                  onClick={() => handleDownload(note.id, note.pdf_path, note.download_count)}
                  className="flex-grow gap-2 text-sm py-2"
                >
                  <Download size={16} aria-hidden="true" />
                  ডাউনলোড করুন
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const projectRef = 'nlciqqwwquniblwuouiq';
                    const publicUrl = `https://${projectRef}.supabase.co/storage/v1/object/public/pdfs/${note.pdf_path}`;
                    navigator.clipboard.writeText(publicUrl);
                    alert('পিডিএফ লিংক ক্লিপবোর্ডে কপি করা হয়েছে!');
                  }}
                  className="gap-2 text-sm py-2"
                  aria-label="Share PDF Link"
                >
                  <Share2 size={16} aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
    </>
  );
};

export default Notes;
