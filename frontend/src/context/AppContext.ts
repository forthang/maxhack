import { createContext } from 'react';

export const ThemeContext = createContext({ darkMode: false, toggleTheme: () => {} });

export const UserContext = createContext({ currentUserId: 1, setCurrentUserId: (id: number) => {} });
