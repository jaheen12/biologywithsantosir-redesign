import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Notes from './pages/Notes';
import Mcq from './pages/Mcq';
import Courses from './pages/Courses';
import Search from './pages/Search';
import Classes from './pages/Classes';
import Topics from './pages/Topics';
import Article from './pages/Article';

function App() {
  return (
    <Router>
      <Layout>
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
      </Layout>
    </Router>
  );
}

export default App;
