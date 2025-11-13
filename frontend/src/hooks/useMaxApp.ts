// src/hooks/useMaxApp.ts
import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/AppContext';
import { User } from '../types/user';

interface MaxAppHook {
  currentUser: User | null;
  isValidating: boolean;
  isValidated: boolean;
  validationError: string | null;
}

export const useMaxApp = (): MaxAppHook => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidated, setIsValidated] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const validate = async () => {
      try {
        // Ensure MAX Bridge is loaded
        if (!window.WebApp || !window.WebApp.initData) {
          // For local development, create a mock user
          if (process.env.NODE_ENV === 'development') {
            console.warn("MAX Bridge not found. Using mock user for development.");
            // Attempt to get a user from a mock API or use a static mock
            // For now, we'll just fail validation to show the error state
            throw new Error("MAX Bridge not found. Cannot validate.");
          } else {
            throw new Error("MAX Bridge not found. Cannot validate.");
          }
        }

        const webApp = window.WebApp;
        
        const response = await fetch('/api/auth/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: webApp.initData }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Validation failed with status: ${response.status}`);
        }

        const user: User = await response.json();
        setCurrentUser(user);
        setIsValidated(true);

      } catch (error: any) {
        setValidationError(error.message);
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, [setCurrentUser]); // Dependency array ensures this runs only once on mount

  return { currentUser, isValidating, isValidated, validationError };
};