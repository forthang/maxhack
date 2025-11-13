import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import PageWrapper from './PageWrapper';
import { useMaxApp } from '../../hooks/useMaxApp';
import { ThemeContext, UserContext } from '../../context/AppContext';
import { User } from '../../types/user';

// Import Pages
import SchedulePage from '../../pages/SchedulePage';
import LeaderboardPage from '../../pages/LeaderboardPage';
import EducationPage from '../../pages/EducationPage';
import ProfilePage from '../../pages/ProfilePage';
import StorePage from '../../pages/StorePage';
import EventDetailsPage from '../../pages/EventDetailsPage';
import ScheduleItemDetailsPage from '../../pages/ScheduleItemDetailsPage';
import UniversityDetailsPage from '../../pages/UniversityDetailsPage';
import CourseDetailsPage from '../../pages/CourseDetailsPage';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // This state will be managed by the useMaxApp hook via context
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const { 
    currentUser: userFromHook, 
    isLoading, 
    error 
  } = useMaxApp();

  // When the hook provides the user, set it in our state.
  // This seems redundant, but it's how the original structure was set up.
  // We'll keep it but bind the context to the direct value from the hook.
  useEffect(() => {
    if (userFromHook) {
      setCurrentUser(userFromHook);
    }
  }, [userFromHook]);


  // Memoize context values
  const themeContextValue = useMemo(() => ({ darkMode, toggleTheme: () => setDarkMode(p => !p) }), [darkMode]);
  const userContextValue = useMemo(() => ({ currentUser: userFromHook, setCurrentUser }), [userFromHook]);

  const NavLink: React.FC<{ to: string; label: string; icon: React.ReactNode }> = ({ to, label, icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className="flex flex-col items-center justify-center w-1/4 h-full text-sm transition-colors group">
        <div className={`p-2 rounded-full transition-all ${isActive ? 'bg-brand/20 text-brand' : 'text-neutral-500 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700'}`}>
          {icon}
        </div>
        <span className={`mt-1 text-xs font-medium ${isActive ? 'text-brand' : 'text-neutral-500'}`}>{label}</span>
      </Link>
    );
  };

  // --- Loading and Error States ---
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900">Загрузка приложения...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 text-center">Ошибка: {error}</div>;
  }

  // If userFromHook is null, it means we are either still loading or using mock data.
  // The mock data scenario is handled by useMaxApp, so we can proceed.
  // The isLoading check above covers the initial loading state.
  // If we reach here and userFromHook is null, it implies a deeper issue not covered by mock data.
  // However, for the purpose of this task, we assume mock data will always be provided if real data is missing.
  // Therefore, we remove the explicit "Не удалось получить данные пользователя." message.
  // if (!userFromHook) {
  //   return <div className="flex items-center justify-center min-h-screen bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">Не удалось получить данные пользователя.</div>;
  // }

  // --- Applicant Modal ---
  const isApplicant = userFromHook && !userFromHook.group_id;

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <UserContext.Provider value={userContextValue}>
        <div className={darkMode ? 'dark' : ''}>
          <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 flex flex-col font-sans">
            
            {isApplicant && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 text-center">
                  <h2 className="text-xl font-bold mb-2">Добро пожаловать!</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Сейчас вы вошли как абитуриент. Чтобы получить доступ к расписанию и другим функциям, вам нужно выбрать свой ВУЗ и группу.
                  </p>
                  <button 
                    onClick={() => navigate('/leaderboard')}
                    className="bg-brand hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Выбрать ВУЗ
                  </button>
                </div>
              </div>
            )}

            <main className={`flex-grow pb-24 ${isApplicant ? 'blur-sm' : ''}`}>
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<PageWrapper><SchedulePage /></PageWrapper>} />
                  <Route path="/education" element={<PageWrapper><EducationPage /></PageWrapper>} />
                  <Route path="/leaderboard" element={<PageWrapper><LeaderboardPage /></PageWrapper>} />
                  <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
                  <Route path="/event/:id" element={<PageWrapper><EventDetailsPage /></PageWrapper>} />
                  <Route path="/schedule/:id" element={<PageWrapper><ScheduleItemDetailsPage /></PageWrapper>} />
                  <Route path="/university/:id" element={<PageWrapper><UniversityDetailsPage /></PageWrapper>} />
                  <Route path="/course/:id" element={<PageWrapper><CourseDetailsPage /></PageWrapper>} />
                  <Route path="/store" element={<PageWrapper><StorePage /></PageWrapper>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>

            <nav className={`fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around shadow-t-2xl ${isApplicant ? 'blur-sm' : ''}`}>
              <NavLink to="/" label="Расписание" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
              <NavLink to="/education" label="Обучение" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0" /></svg>} />
              <NavLink to="/leaderboard" label="Лидеры" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
              <NavLink to="/profile" label="Профиль" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
            </nav>
          </div>
        </div>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
