import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInitialUserLoad } from '../../hooks/useMaxApp';
import { ThemeContext, UserContext } from '../../context/AppContext';
import { User } from '../../types/user';

// Import Pages (needed for type checking, even if not rendered yet)
import SchedulePage from '../../pages/SchedulePage';
import EventsPage from '../../pages/EventsPage';
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
  const navigate = useNavigate();
  
  // This is now the single source of truth for the user state.
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // The new hook is for initial load only.
  const { currentUser: initialUser, isLoading, error } = useInitialUserLoad();

  // This effect runs once when the initial user is loaded to populate the app's state.
  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser);
    }
  }, [initialUser]);

  // Memoize context values. The context now gets the state and setter from App.
  const themeContextValue = useMemo(() => ({ darkMode, toggleTheme: () => setDarkMode(p => !p) }), [darkMode]);
  const userContextValue = useMemo(() => ({ currentUser, setCurrentUser }), [currentUser]);

  // --- Loading and Error States ---
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900">Загрузка приложения...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 text-center">Ошибка: {error}</div>;
  }
  
  const isApplicant = currentUser && !currentUser.group_id;

  // Debugging Modal for MAX Bridge User Data
  const [showDebugModal, setShowDebugModal] = useState(false);
  const isMaxApp = typeof window !== 'undefined' && typeof (window as any).WebApp !== 'undefined';

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <UserContext.Provider value={userContextValue}>
        <div className={darkMode ? 'dark' : ''}>
          <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 flex flex-col font-sans">
            
            {/* Debugging Modal - Temporarily Disabled */}
            {/* {isMaxApp && currentUser && (
              <div className="fixed top-4 right-4 z-50">
                <button
                  onClick={() => setShowDebugModal(true)}
                  className="bg-blue-500 text-white p-2 rounded-full shadow-lg"
                >
                  Debug
                </button>
              </div>
            )} */}

            {/* {showDebugModal && isMaxApp && currentUser && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 text-left max-w-md w-full relative">
                  <h2 className="text-xl font-bold mb-4">MAX User Data (Debug)</h2>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(currentUser, null, 2)}
                  </pre>
                  <button
                    onClick={() => setShowDebugModal(false)}
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            )} */}

            {/* Applicant Modal - Temporarily Disabled */}
            {/* {isApplicant && (
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
            )} */}

            <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.5rem' }}>
              Context Providers are active. Modals are disabled.
            </div>
          </div>
        </div>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;

