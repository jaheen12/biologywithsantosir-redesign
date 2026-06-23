import React from 'react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';

const About: React.FC = () => {
  return (
    <Container className="py-12 font-sans max-w-4xl">
      <div className="text-center mb-12">
        <div className="w-32 h-32 rounded-full border-4 border-primary/20 bg-primary/10 flex items-center justify-center text-5xl shadow-inner mx-auto mb-4">
          👨‍🏫
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-2">
          Santo Sir (সান্টো স্যার)
        </h1>
        <p className="text-primary font-semibold text-lg">MSc in Zoology, University of Dhaka</p>
      </div>

      <div className="grid gap-10">
        {/* Academic Credentials */}
        <section className="bg-surface-alt border border-border rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            🎓 শিক্ষাগত যোগ্যতা (Academic Credentials)
          </h2>
          <div className="space-y-4">
            <div className="border-l-2 border-primary pl-4">
              <h4 className="font-bold text-text-primary">MSc in Zoology</h4>
              <p className="text-sm text-text-secondary">University of Dhaka (ঢাকা বিশ্ববিদ্যালয়)</p>
              <p className="text-xs text-text-muted">Specialization: Entomology/Fisheries</p>
            </div>
            <div className="border-l-2 border-primary pl-4">
              <h4 className="font-bold text-text-primary">BSc (Hons) in Zoology</h4>
              <p className="text-sm text-text-secondary">University of Dhaka (ঢাকা বিশ্ববিদ্যালয়)</p>
            </div>
          </div>
        </section>

        {/* Experience & stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-border rounded-xl p-6">
            <h3 className="font-bold text-text-primary mb-2">📚 শিক্ষাদানের অভিজ্ঞতা</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              বিগত ১০ বছর ধরে অফলাইন ও অনলাইনে নিয়মিত এসএসসি, এইচএসসি এবং অনার্স স্তরের জীববিজ্ঞানের ক্লাস নিয়ে আসছি। এই সময়ে ৫০,০০০-এরও বেশি শিক্ষার্থী আমার লেকচার এবং নোটস দ্বারা উপকৃত হয়েছে।
            </p>
          </div>
          <div className="border border-border rounded-xl p-6">
            <h3 className="font-bold text-text-primary mb-2">🎯 আমার মূল লক্ষ্য</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              জীববিজ্ঞান শুধু চিত্র আঁকা আর মুখস্থ করার বিষয় নয়। আমাদের শরীরের অঙ্গাণু ও উদ্ভিদকোষের জটিল বিক্রিয়াগুলো যদি শিক্ষার্থীরা অন্তর দিয়ে অনুধাবন করতে পারে, তবেই আমার শিক্ষকতা সফল।
            </p>
          </div>
        </section>

        {/* Dynamic quotes */}
        <section className="text-center bg-primary-light border border-primary/10 rounded-xl p-8">
          <h3 className="text-primary font-bold text-lg mb-2">"জীববিজ্ঞান শেখো সহজভাবে, বুঝে বুঝে"</h3>
          <p className="text-text-secondary text-sm max-w-xl mx-auto italic leading-relaxed">
            পরীক্ষার চাপে জীববিজ্ঞানের সংজ্ঞাগুলো যেন বোঝা মনে না হয়। প্রতিটি জটিল চক্র (যেমন- ক্রেবস চক্র, গ্লাইকোলাইসিস) আমরা চিত্রসহ সহজ ও আকর্ষণীয় করে শিখবো।
          </p>
        </section>

        <div className="text-center mt-6">
          <a href="mailto:contact@biologywithsantosir.com">
            <Button size="lg">সরাসরি ইমেইলে যোগাযোগ করুন</Button>
          </a>
        </div>
      </div>
    </Container>
  );
};

export default About;
