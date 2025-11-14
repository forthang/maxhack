import React, { useState, useMemo, useEffect } from 'react';
import { ThemeContext, UserContext } from '../../context/AppContext';
import { User } from '../../types/user';

interface AppProvidersProps {
  initialUser: User | null;
  children: React.ReactNode;
  onUserUpdate: (user: User | null) => void;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ initialUser, children, onUserUpdate }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);

  useEffect(() => {
    onUserUpdate(currentUser);
  }, [currentUser, onUserUpdate]);

  const themeContextValue = useMemo(() => ({ darkMode, toggleTheme: () => setDarkMode(p => !p) }), [darkMode]);
  const userContextValue = useMemo(() => ({ currentUser, setCurrentUser }), [currentUser]);

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
