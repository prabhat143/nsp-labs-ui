import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { SamplesProvider } from '../contexts/SamplesContext';
import { apiService } from '../services/api';
import { SampleSubmission } from '../types';
import NotificationBell from './NotificationBell';
import { 
  User, 
  FlaskConical, 
  FileText, 
  LogOut, 
  Home,
  Upload,
  Menu,
  X
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const previousSamplesRef = useRef<SampleSubmission[]>([]);
  const [lastFetch, setLastFetch] = useState<number>(0);
  
  // Samples state for global context
  const [samples, setSamples] = useState<SampleSubmission[]>([]);
  const [samplesLoading, setSamplesLoading] = useState(true);
  const [samplesError, setSamplesError] = useState<string | null>(null);

  // Global polling for sample updates - runs on all pages
  useEffect(() => {
    if (!user?.id) return;

    const fetchSamplesForNotifications = async (isRefresh = false) => {
      // Prevent multiple simultaneous requests
      const now = Date.now();
      if (isRefresh && now - lastFetch < 2000) { // Minimum 2 seconds between requests
        return;
      }

      try {
        setSamplesError(null);
        setLastFetch(now);
        const sampleSubmissions = await apiService.getSampleSubmissions(user.id);
        
        // Update global samples state
        setSamples(sampleSubmissions);
        setSamplesLoading(false);
        
        // Compare with previous samples to detect changes and generate notifications
        if (isRefresh && previousSamplesRef.current.length > 0) {
          const previousSamples = previousSamplesRef.current;
          console.log('Layout polling - comparing with previous samples:', previousSamples.length);
          
          sampleSubmissions.forEach((currentSample) => {
            const previousSample = previousSamples.find(p => p.id === currentSample.id);
            
            if (previousSample) {
              console.log(`Comparing sample ${currentSample.id}:`, {
                previousStatus: previousSample.status,
                currentStatus: currentSample.status,
                previousAssigned: previousSample.assigned,
                currentAssigned: currentSample.assigned
              });
              
              // Check for status changes
              if (previousSample.status !== currentSample.status) {
                console.log('Status change detected, adding notification');
                addNotification({
                  type: 'sample_status_change',
                  title: 'Sample Status Updated',
                  message: `Sample status changed from ${previousSample.status.toUpperCase()} to ${currentSample.status.toUpperCase()}`,
                  sampleId: currentSample.id,
                  data: { previousStatus: previousSample.status, newStatus: currentSample.status }
                });
              }
              
              // Check for agent assignment changes - improved logic
              if (previousSample.assigned !== currentSample.assigned) {
                console.log('Agent assignment change detected');
                if (currentSample.assigned && !previousSample.assigned) {
                  // Agent was assigned
                  console.log('Agent assigned, adding notification');
                  addNotification({
                    type: 'sample_assigned',
                    title: 'Agent Assigned',
                    message: `Agent ${currentSample.assigned} has been assigned to your sample`,
                    sampleId: currentSample.id,
                    data: { agent: currentSample.assigned }
                  });
                } else if (!currentSample.assigned && previousSample.assigned) {
                  // Agent was unassigned
                  console.log('Agent unassigned, adding notification');
                  addNotification({
                    type: 'sample_status_change',
                    title: 'Agent Unassigned',
                    message: `Agent ${previousSample.assigned} has been unassigned from your sample`,
                    sampleId: currentSample.id,
                    data: { previousAgent: previousSample.assigned }
                  });
                } else if (currentSample.assigned && previousSample.assigned && currentSample.assigned !== previousSample.assigned) {
                  // Agent was changed
                  addNotification({
                    type: 'sample_assigned',
                    title: 'Agent Changed',
                    message: `Agent changed from ${previousSample.assigned} to ${currentSample.assigned}`,
                    sampleId: currentSample.id,
                    data: { previousAgent: previousSample.assigned, newAgent: currentSample.assigned }
                  });
                }
              }
              
              // Check for completion
              if (previousSample.status !== 'COMPLETED' && currentSample.status === 'COMPLETED') {
                addNotification({
                  type: 'sample_completed',
                  title: 'Sample Completed',
                  message: `Your sample testing has been completed. Report is now available.`,
                  sampleId: currentSample.id,
                  data: { completedAt: new Date() }
                });
              }
            }
          });
        }
        
        // Update previous samples reference
        previousSamplesRef.current = sampleSubmissions;
      } catch (err) {
        console.error('Failed to fetch samples for notifications:', err);
        setSamplesError('Failed to fetch sample data');
        setSamplesLoading(false);
      }
    };

    // Initial fetch
    fetchSamplesForNotifications();

    // Set up polling for real-time updates every 5 seconds
    const pollInterval = setInterval(() => {
      fetchSamplesForNotifications(true); // Mark as refresh
    }, 5000); // 5 seconds - more reasonable polling interval

    // Cleanup interval on unmount
    return () => {
      clearInterval(pollInterval);
    };
  }, [user?.id, addNotification]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/submit-sample', icon: Upload, label: 'Submit Sample' },
    { path: '/samples', icon: FlaskConical, label: 'My Samples' },
    { path: '/reports', icon: FileText, label: 'Reports' },
  ];

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-cyan-500 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <img 
                  src="/favicon.jpeg" 
                  alt="NSP Labs Logo" 
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">NSP Labs</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Analytical Labs Private Limited</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <NotificationBell />
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900 truncate max-w-32 lg:max-w-none">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate max-w-32 lg:max-w-none">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-2 sm:px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-14 sm:top-16 left-0 right-0 bg-white shadow-lg border-t z-40">
            <div className="px-4 py-2">
              <div className="flex items-center space-x-3 py-3 border-b border-gray-200 md:hidden">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <ul className="space-y-1 py-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => handleMenuItemClick(item.path)}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-cyan-500 text-white shadow-md'
                            : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-700'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <nav className="hidden lg:block w-64 bg-white shadow-lg min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-cyan-500 text-white shadow-md'
                          : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-700'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <SamplesProvider samples={samples} loading={samplesLoading} error={samplesError}>
              <Outlet />
            </SamplesProvider>
          </div>
        </main>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;