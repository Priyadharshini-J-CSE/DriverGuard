import { useState, useEffect } from 'react';

const AUTH_ROUTES = ['/login', '/register', '/onboarding', '/setup/'];

function isAuthRoute() {
  return AUTH_ROUTES.some((r) => window.location.pathname.startsWith(r));
}

export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (isAuthRoute()) {
      document.documentElement.classList.remove('dark');
      return;
    }
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = () => setDark((prev) => !prev);

  const forceLight = () => {
    document.documentElement.classList.remove('dark');
    setDark(false);
  };

  return { dark, toggle, forceLight };
}
