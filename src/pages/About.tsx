import React from 'react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import SEO from '../components/SEO';

const About: React.FC = () => {
  return (
    <>
      <SEO 
        title="শিক্ষক পরিচিতি" 
        description="সান্টো স্যার (Santo Sir) - ঢাকা বিশ্ববিদ্যালয় থেকে প্রাণিবিদ্যায় এমএসসি এবং দীর্ঘ ১০ বছরেরও বেশি সময় ধরে জীববিজ্ঞান শিক্ষকতায় নিয়োজিত।" 
      />
      <Container className="py-12 font-sans max-w-4xl">
      <div className="text-center mb-12">
        <img 
          src="/favicon.png" 
          alt="Santo Sir" 
          width="128"
          height="128"
          className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 shadow-md mx-auto mb-4"
        />
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-2">
          Santo Sir (সান্টো স্যার)
        </h1>
        <p className="text-primary font-semibold text-lg">MSc in Zoology, University of Dhaka</p>
      </div>

      <div className="grid gap-10">
        {/* Academic Credentials */}
        <section className="bg-surface-alt border border-border rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <span role="img" aria-label="graduation cap">🎓</span> শিক্ষাগত যোগ্যতা (Academic Credentials)
          </h2>
          <div className="space-y-4">
            <div className="border-l-2 border-primary pl-4">
              <h4 className="font-bold text-text-primary">MSc in Zoology</h4>
              <p className="text-base text-text-secondary">University of Dhaka (ঢাকা বিশ্ববিদ্যালয়)</p>
              <p className="text-base text-text-muted">Specialization: Entomology/Fisheries</p>
            </div>
            <div className="border-l-2 border-primary pl-4">
              <h4 className="font-bold text-text-primary">BSc (Hons) in Zoology</h4>
              <p className="text-base text-text-secondary">University of Dhaka (ঢাকা বিশ্ববিদ্যালয়)</p>
            </div>
          </div>
        </section>

        {/* Experience & stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-text-primary mb-2"><span role="img" aria-label="books">📚</span> শিক্ষাদানের অভিজ্ঞতা</h3>
            <p className="text-text-secondary text-base leading-relaxed">
              বিগত 10 বছর ধরে অফলাইন ও অনলাইনে নিয়মিত এসএসসি, এইচএসসি এবং অনার্স স্তরের জীববিজ্ঞানের ক্লাস নিয়ে আসছি। এই সময়ে 50,000-এরও বেশি শিক্ষার্থী আমার লেকচার এবং নোটস দ্বারা উপকৃত হয়েছে।
            </p>
          </div>
          <div className="border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-text-primary mb-2"><span role="img" aria-label="bullseye">🎯</span> আমার মূল লক্ষ্য</h3>
            <p className="text-text-secondary text-base leading-relaxed">
              জীববিজ্ঞান শুধু চিত্র আঁকা আর মুখস্থ করার বিষয় নয়। আমাদের শরীরের অঙ্গাণু ও উদ্ভিদকোষের জটিল বিক্রিয়াগুলো যদি শিক্ষার্থীরা অন্তর দিয়ে অনুধাবন করতে পারে, তবেই আমার শিক্ষকতা সফল।
            </p>
          </div>
        </section>

        {/* Personal Message from Santo Sir */}
        <section className="bg-primary-light/40 border border-primary/20 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <span role="img" aria-label="writing hand">✍️</span> আমার কথা ও স্বপ্ন (My Story & Vision)
          </h2>
          <div className="text-text-secondary text-base leading-relaxed space-y-4 font-sans">
            <p>
              আমি একজন শিক্ষক। পড়ানো পেশা থেকে কখন নেশায় পরিণত হয়েছে তা আমি নিজেই বুঝতেই পারিনি। মানুষকে শেখাতে আমার ভীষণ ভালোলাগে। আর ক্লাসরুমের চার দেয়ালের বাইরে গিয়েও শিক্ষার্থীদের শেখানোর তীব্র ইচ্ছা থেকেই মূলত এই জীববিজ্ঞানের ব্লগসাইট তৈরি করেছি।
            </p>
            <p>
              আমার জ্ঞান সীমিত হতে পারে, তবে সঠিক ও নির্ভেজাল জ্ঞান মানুষের মাঝে ছড়িয়ে দিতে আমি দৃঢ় প্রতিজ্ঞ। আমি বই পড়তে ভালোবাসি এবং লেখালেখি করি একান্তই শখের বশে। খুব ভালো ব্যাকরণ না জানার কারণে লেখার মান হয়তো মোটামুটি হতে পারে, তবে আমার মূল দৃষ্টি শিক্ষার্থীদের সঠিকভাবে তথ্য জানানোর দিকে—ভাষার মাধুর্যের দিকে নয়।
            </p>
            <p>
              আমার যেটুকু সামর্থ্য আছে, সেটুকু দিয়েই আমি চেষ্টা করে যাবো। স্বপ্ন দেখি এই ব্লগসাইট একদিন প্রতিটি শিক্ষার্থীর দরজায় পৌঁছাবে এবং সবার জ্ঞান ভাণ্ডার সমৃদ্ধ করবে। আপনাদের সবার কাছে আমার শুধু একটিই চাওয়া—আমার এই ভালো কাজে সহযোগিতা করুন এবং মানুষের মাঝে অজানাকে জানার কৌতুহল মেটানোর এই ক্ষুদ্র প্রচেষ্টাকে অব্যাহত রাখতে সাহায্য করুন।
            </p>
          </div>
        </section>

        {/* Dynamic quotes */}
        <section className="text-center bg-primary-light border border-primary/10 rounded-xl p-8">
          <h3 className="text-primary font-bold text-lg mb-2">"জীববিজ্ঞান শেখো সহজভাবে, বুঝে বুঝে"</h3>
          <p className="text-text-secondary text-base max-w-xl mx-auto italic leading-relaxed">
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
    </>
  );
};

export default About;
