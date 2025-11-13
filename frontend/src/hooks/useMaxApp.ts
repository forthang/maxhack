// src/hooks/useMaxApp.ts
import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/AppContext';
import { User } from '../types/user';

interface MaxAppHook {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

export const useMaxApp = (): MaxAppHook => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const login = async () => {
      try {
        // 1. Check for MAX Bridge
        // @ts-ignore
        const webApp = window.WebApp;

        if (!webApp || !webApp.initDataUnsafe || !webApp.initDataUnsafe.user) {
          const errorMsg = "MAX Bridge data not found (window.WebApp.initDataUnsafe.user is missing).";
          if (process.env.NODE_ENV === 'development') {
            console.warn(errorMsg, "This is expected in a local browser environment.");
          }
          throw new Error(errorMsg);
        }

        const userData = webApp.initDataUnsafe.user;

        if (!userData || !userData.id) {
          throw new Error("User ID not found in MAX Bridge data.");
        }
        
        // 2. Call the new /api/auth/login endpoint
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: "Failed to parse error JSON." }));
          throw new Error(errorData.detail || `Login failed with status: ${response.status}`);
        }

        // 3. Set user context
        const userProfile: User = await response.json();
        setCurrentUser(userProfile);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run login if there's no user in the context yet
    if (!currentUser) {
      login();
    } else {
      setIsLoading(false);
    }
  }, [currentUser, setCurrentUser]);

  return { currentUser, isLoading, error };
};