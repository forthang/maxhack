import React, { useState, createContext } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';

import Schedule from './components/Schedule';
import Leaderboard from './components/Leaderboard';
import Education from './components/Education';
import Profile from './components/Profile';
import Store from './components/Store';
import EventDetails from './components/EventDetails';

// Create a theme context so that nested components (e.g. Profile) can
// toggle dark/light mode. The default implementation does nothing.
export const ThemeContext = createContext({ darkMode: false, toggleTheme: () => {} });

// Main application component using Tailwind CSS for styling. A dark/light
// theme is toggled by adding or removing the `dark` class on the outer
// container. Navigation is placed at the bottom of the screen for
// mobile‑friendly interaction.

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
          <div className="flex-grow pb-14">
            <Routes>
              <Route path="/" element={<Schedule />} />
              <Route path="/education" element={<Education />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/store" element={<Store />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-t border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-around">
            <Link to="/" className="flex flex-col items-center px-2 py-1 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M3 10h18M5 16h14" />
              </svg>
              Расписание
            </Link>
            <Link to="/education" className="flex flex-col items-center px-2 py-1 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0118 21H6a12.083 12.083 0 01-.16-10.422L12 14z" />
              </svg>
              Обучение
            </Link>
            <Link to="/leaderboard" className="flex flex-col items-center px-2 py-1 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3V3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13l2 2 4-4" />
              </svg>
              Лидеры
            </Link>
            <Link to="/profile" className="flex flex-col items-center px-2 py-1 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18v-1a6 6 0 0112 0v1" />
              </svg>
              Профиль
            </Link>
          </nav>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default App;