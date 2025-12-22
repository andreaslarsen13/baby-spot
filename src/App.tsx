import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Prototype from './pages/Prototype';
import Library from './pages/Library';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Prototype />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </Router>
  );
}

export default App;
