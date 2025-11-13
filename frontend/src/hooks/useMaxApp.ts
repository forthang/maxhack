import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// This is a global object provided by the MAX Bridge script.
// We declare it here to inform TypeScript about its existence.
declare global {
  interface Window {
    WebApp?: any;
  }
}

export const useMaxApp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const webApp = window.WebApp;
    if (!webApp) {
      console.log("MAX WebApp not found, running in browser mode.");
      return;
    }

    // 1. Inform MAX that the app is ready
    webApp.ready();

    // 2. Back button management
    const backButton = webApp.BackButton;

    const handleBackClick = () => {
      navigate(-1);
    };

    if (location.pathname !== '/') {
      backButton.show();
      backButton.onClick(handleBackClick);
    } else {
      backButton.hide();
    }

    // Cleanup listener on component unmount or location change
    return () => {
      if (webApp && webApp.BackButton) {
        webApp.BackButton.offClick(handleBackClick);
      }
    };
  }, [location, navigate]);

  const getUserId = (): number => {
    if (window.WebApp && window.WebApp.initDataUnsafe && window.WebApp.initDataUnsafe.user) {
      return window.WebApp.initDataUnsafe.user.id;
    }
    // Return a default user ID for local development
    return 1;
  };

  return { getUserId };
};
