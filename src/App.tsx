import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { VersionProvider } from './components/library/VersionContext';
import Prototype from './pages/Prototype';
import Library from './pages/Library';
import UIKit from './pages/UIKit';
import Onboarding from './pages/Onboarding';
import Spotlight from './pages/Spotlight';

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

// Animated routes wrapper
function AnimatedRoutes({ onLogin }: { onLogin: () => void }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Prototype />} />
        <Route path="/spotlight" element={<Spotlight />} />
        <Route path="/library" element={<Library />} />
        <Route path="/ui" element={<UIKit />} />
        <Route path="/onboarding" element={<Onboarding onComplete={onLogin} />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { login } = useAuthState();

  return (
    <VersionProvider>
      <Router>
        <AnimatedRoutes onLogin={login} />
      </Router>
    </VersionProvider>
  );
}

export default App;
