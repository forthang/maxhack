import { useEffect, useState, useCallback } from 'react';
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
  const [isValidated, setIsValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number>(1); // Default to 1 for browser mode

  const validateData = useCallback(async (webApp: any) => {
    setIsValidating(true);
    setValidationError(null);
    try {
      const resp = await fetch(`/api/auth/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: webApp.initData }),
      });

      if (resp.ok) {
        setIsValidated(true);
        if (webApp.initDataUnsafe && webApp.initDataUnsafe.user) {
          setUserId(webApp.initDataUnsafe.user.id);
        }
      } else {
        const err = await resp.json();
        setValidationError(err.detail || 'Validation failed');
        setIsValidated(false);
      }
    } catch (e) {
      setValidationError('Network error during validation');
      setIsValidated(false);
    } finally {
      setIsValidating(false);
    }
  }, []);

  useEffect(() => {
    const webApp = window.WebApp;
    if (!webApp) {
      console.log("MAX WebApp not found, running in browser mode.");
      setIsValidating(false);
      setIsValidated(true); // In browser mode, we assume it's "valid" for dev purposes
      return;
    }

    // 1. Validate data
    validateData(webApp);
    
    // 2. Inform MAX that the app is ready
    webApp.ready();

    // 3. Back button management
    const backButton = webApp.BackButton;
    const handleBackClick = () => navigate(-1);

    if (location.pathname !== '/') {
      backButton.show();
      backButton.onClick(handleBackClick);
    } else {
      backButton.hide();
    }

    // Cleanup listener
    return () => {
      if (webApp && webApp.BackButton) {
        webApp.BackButton.offClick(handleBackClick);
      }
    };
  }, [location, navigate, validateData]);

  return {
    userId,
    isValidating,
    isValidated,
    validationError,
    isMaxApp: !!window.WebApp,
  };
};
