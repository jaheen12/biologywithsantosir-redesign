import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Lazy load page components for route code-splitting
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Notes = lazy(() => import('./pages/Notes'));
const Mcq = lazy(() => import('./pages/Mcq'));
const Courses = lazy(() => import('./pages/Courses'));
const Search = lazy(() => import('./pages/Search'));
const Classes = lazy(() => import('./pages/Classes'));
const Topics = lazy(() => import('./pages/Topics'));
const Article = lazy(() => import('./pages/Article'));

// Sleek loading fallback spinner matching the brand green theme
const RouteLoading: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center font-sans" aria-live="polite" aria-busy="true">
    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
    <p className="text-text-secondary text-sm font-semibold animate-pulse">লোড হচ্ছে...</p>
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/classes/:classId" element={<Classes />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/topics/:topicId" element={<Topics />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/topics/:topicId/:slug" element={<Article />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/mcq" element={<Mcq />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
