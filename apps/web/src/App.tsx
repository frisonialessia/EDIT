import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { EventDashboard } from '@/components/EventDashboard';
import { ToastProvider } from '@/components/ui/toast';
import { LandingPage } from '@/pages/LandingPage';

export function App(): React.JSX.Element {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = (): void => {
    setIsDark((current) => !current);
  };

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage isDark={isDark} onToggleTheme={toggleTheme} />} />
          <Route
            path="/dashboard"
            element={<EventDashboard isDark={isDark} onToggleTheme={toggleTheme} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
