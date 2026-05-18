import { useState, useEffect } from 'react';

const getBreakpoints = () => {
  const w = typeof window !== 'undefined' ? window.innerWidth : 375;
  return {
    isPhone:   w < 768,
    isTablet:  w >= 768 && w < 1024,
    isDesktop: w >= 1024,
    width: w
  };
};

const useResponsive = () => {
  const [bp, setBp] = useState(getBreakpoints);

  useEffect(() => {
    const handler = () => setBp(getBreakpoints());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return bp;
};

export default useResponsive;
