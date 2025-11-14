// src/hooks/useMaxApp.ts
import { useState, useEffect } from 'react';
import { User } from '../types/user';

interface MaxAppHook {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

export const useInitialUserLoad = (): MaxAppHook => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const login = async () => {
      try {
        // 1. Check for MAX Bridge and prepare payload
        let payload;
        // @ts-ignore
        const webApp = window.WebApp;

        if (!webApp || !webApp.initData) {
          // Provide mock user data for development/testing
          payload = {
            id: -1, // Use a distinct ID for mock user
            first_name: "Mock",
            last_name: "User",
            username: "mockuser",
            photo_url: "https://i.pravatar.cc/150?img=68",
            language_code: "ru",
          };
        } else {
          payload = { initData: webApp.initData };
        }
        
        // 2. Call the /api/auth/login endpoint
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: "Failed to parse error JSON." }));
          throw new Error(errorData.detail || `Login failed with status: ${response.status}`);
        }

        // 3. Set user state
        const userProfile: User = await response.json();
        setCurrentUser(userProfile);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    login();
  }, []); // Empty dependency array ensures this runs only once

  return { currentUser, isLoading, error };
};