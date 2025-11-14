import React, { createContext } from 'react';
import { User } from '../types/user';

// Define the shape of the User context
interface UserContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Define the shape of the Theme context
interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
}

// Create the contexts with default values
export const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
});

export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleTheme: () => {},
});
