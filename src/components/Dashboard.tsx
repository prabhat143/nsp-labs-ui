
import React from 'react';
import DashboardDesktopView from './DashboardDesktopView';
import DashboardMobileView from './DashboardMobileView';

// Simple responsive hook
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(() => window.innerWidth >= 1024);
  React.useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isDesktop;
}

const Dashboard: React.FC = () => {
  const isDesktop = useIsDesktop();
  return isDesktop ? <DashboardDesktopView /> : <DashboardMobileView />;
};

export default Dashboard;
