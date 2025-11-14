import React, { useState, useMemo } from 'react';
import { ThemeContext, UserContext } from '../../context/AppContext';
import { User } from '../../types/user';

interface AppProvidersProps {
  initialUser: User | null;
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ initialUser, children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);

  const themeContextValue = useMemo(() => {
    return { darkMode, toggleTheme: () => setDarkMode(p => !p) };
  }, [darkMode]);

  const userContextValue = useMemo(() => {
    return { currentUser, setCurrentUser };
  }, [currentUser]);

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <UserContext.Provider value={userContextValue}>
        <div className={darkMode ? 'dark' : ''}>
          {children}
        </div>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
};
