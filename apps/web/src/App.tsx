import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ToastProvider } from '@/components/ui/toast';
import { LandingPage } from '@/pages/LandingPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { CalendarView } from '@/pages/dashboard/CalendarView';
import { DashboardOverview } from '@/pages/dashboard/DashboardOverview';
import { MessagesPage } from '@/pages/dashboard/MessagesPage';
import { OrchestrationView } from '@/pages/dashboard/OrchestrationView';
import { TimelineView } from '@/pages/dashboard/TimelineView';

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
          <Route element={<AppShell isDark={isDark} onToggleTheme={toggleTheme} />}>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/dashboard/calendar" element={<CalendarView />} />
            <Route path="/dashboard/timeline" element={<TimelineView />} />
            <Route path="/dashboard/orchestration" element={<OrchestrationView />} />
            <Route path="/dashboard/messages" element={<MessagesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
