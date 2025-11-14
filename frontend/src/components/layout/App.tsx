import React, { useState, useMemo, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Temporarily removed for debugging
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
  // const navigate = useNavigate(); // Temporarily removed for debugging
  
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
    // <ThemeContext.Provider value={themeContextValue}>
    //   <UserContext.Provider value={userContextValue}>
        <div className={darkMode ? 'dark' : ''}>
          <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 flex flex-col font-sans">
            
            <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.5rem' }}>
              Final test: Only hooks are active. No providers.
            </div>
          </div>
        </div>
    //   </UserContext.Provider>
    // </ThemeContext.Provider>
  );
};

export default App;



