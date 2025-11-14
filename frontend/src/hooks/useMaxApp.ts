import { useState, useEffect } from 'react';
import { User } from '../types/user';

// This is a mock for local development when window.WebApp is not available
const getMockUser = () => ({
  id: 999,
  first_name: 'Local',
  last_name: 'User',
  username: 'localuser',
  language_code: 'en',
  photo_url: 'https://t.me/i/userpic/320/7gLIAT8o62a5m0E8d_d8K8a888a8E8E8.jpg',
  // Set group_id to null to test the "applicant" flow
  group_id: null, 
  university_id: null,
  xp: 100,
  coins: 50,
  completed_courses: [],
  purchases: [],
});

export const useInitialUserLoad = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let telegramUser = null;
        const isMaxApp = typeof window !== 'undefined' && (window as any).WebApp && (window as any).WebApp.initData;

        if (isMaxApp) {
          telegramUser = (window as any).WebApp.initDataUnsafe?.user;
        } else {
          console.warn("MAX Bridge not found, using mock user data for local development.");
          telegramUser = getMockUser();
        }

        if (!telegramUser) {
          throw new Error("Could not retrieve user data from MAX Bridge or mock.");
        }

        const response = await fetch('/api/profile', {
          headers: {
            'Content-Type': 'application/json',
            'X-Telegram-User': JSON.stringify(telegramUser),
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch profile');
        }

        const userData: User = await response.json();
        setCurrentUser(userData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { currentUser, isLoading, error, setCurrentUser };
};
