import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect URLs without trailing slash to include trailing slash
    if (pathname !== '/' && !pathname.endsWith('/')) {
      navigate(pathname + '/', { replace: true });
      return;
    }
    
    // Scroll to top when pathname changes
    window.scrollTo(0, 0);
  }, [pathname, navigate]);

  return null;
};

export default ScrollToTop;