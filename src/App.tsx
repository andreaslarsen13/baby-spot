import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { VersionProvider } from './components/library/VersionContext';
import Prototype from './pages/Prototype';
import Library from './pages/Library';
import UIKit from './pages/UIKit';

function App() {
  return (
    <VersionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Prototype />} />
          <Route path="/library" element={<Library />} />
          <Route path="/ui" element={<UIKit />} />
        </Routes>
      </Router>
    </VersionProvider>
  );
}

export default App;
