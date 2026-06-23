import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Notes from './pages/Notes';
import Mcq from './pages/Mcq';
import Courses from './pages/Courses';
import Search from './pages/Search';
import Classes from './pages/Classes';
import Topics from './pages/Topics';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-surface text-text-primary">
        {/* Simple Temporary Navigation for testing Phase 1 */}
        <header className="bg-primary text-white p-4 shadow-md">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-display font-bold">🌿 Santo Sir Bio</Link>
            <nav className="flex gap-4 text-sm font-semibold">
              <Link to="/" className="hover:text-primary-light">Home</Link>
              <Link to="/about" className="hover:text-primary-light">About</Link>
              <Link to="/classes/ssc-biology" className="hover:text-primary-light">SSC Bio</Link>
              <Link to="/classes/hsc-zoology" className="hover:text-primary-light">HSC Zoo</Link>
              <Link to="/topics/genetics" className="hover:text-primary-light">Genetics</Link>
              <Link to="/notes" className="hover:text-primary-light">Notes</Link>
              <Link to="/mcq" className="hover:text-primary-light">MCQ</Link>
              <Link to="/courses" className="hover:text-primary-light">Courses</Link>
              <Link to="/search" className="hover:text-primary-light">Search</Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/classes/:classId" element={<Classes />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/topics/:topicId" element={<Topics />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/mcq" element={<Mcq />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </main>

        <footer className="bg-surface-alt border-t border-border p-4 text-center text-xs text-text-secondary">
          © 2026 BiologywithSantosir.com. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;
