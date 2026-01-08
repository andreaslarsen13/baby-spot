import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { VersionProvider } from './components/library/VersionContext';
import Prototype from './pages/Prototype';
import Library from './pages/Library';
import UIKit from './pages/UIKit';
import Onboarding from './pages/Onboarding';

// Helper to persist auth state
const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check localStorage for auth state on mount
    const authState = localStorage.getItem('spot_authenticated');
    setIsAuthenticated(authState === 'true');
  }, []);

  const login = () => {
    localStorage.setItem('spot_authenticated', 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('spot_authenticated');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
};

function App() {
  const { login } = useAuthState();

  return (
    <VersionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Prototype />} />
          <Route path="/library" element={<Library />} />
          <Route path="/ui" element={<UIKit />} />
          <Route path="/onboarding" element={<Onboarding onComplete={login} />} />
        </Routes>
      </Router>
    </VersionProvider>
  );
}

export default App;
