import { createContext } from 'react';
import { User } from '../types/user';

export const ThemeContext = createContext({ darkMode: false, toggleTheme: () => {} });

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
});
