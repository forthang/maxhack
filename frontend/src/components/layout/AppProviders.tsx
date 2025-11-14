import React, { useState, useMemo, useEffect } from 'react';
import { ThemeContext, UserContext } from '../../context/AppContext';
import { User } from '../../types/user';

interface AppProvidersProps {
  initialUser: User | null;
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ initialUser, children }) => {
  console.log('[Render] AppProviders');

  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    console.log('[Effect] AppProviders: initialUser changed', initialUser);
    if (initialUser) {
      setCurrentUser(initialUser);
    }
  }, [initialUser]);

  const themeContextValue = useMemo(() => {
    console.log('[Memo] Recomputing themeContextValue');
    return { darkMode, toggleTheme: () => setDarkMode(p => !p) };
  }, [darkMode]);

  const userContextValue = useMemo(() => {
    console.log('[Memo] Recomputing userContextValue');
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
