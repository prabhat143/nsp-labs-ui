// src/layouts/Layout.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { SamplesProvider } from '../contexts/SamplesContext';
import { apiService } from '../services/api';
import { SampleSubmission } from '../types';
import NotificationBell from './NotificationBell';
import Profile from './Profile';
import { useRealtime } from '../contexts/RealtimeContext';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  User,
  FlaskConical,
  FileText,
  LogOut,
  Home,
  Upload,
  Menu,
  X,
  Users,
  ChevronDown,
  Settings,
  BookOpen
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const [samples, setSamples] = useState<SampleSubmission[]>([]);
  const [samplesLoading, setSamplesLoading] = useState(true);
  const [samplesError, setSamplesError] = useState<string | null>(null);
  const { setIsRealtime } = useRealtime();

  useWebSocket({
    user,
    addNotification,
    setIsRealtime,
    setSamples,
    setSamplesLoading,
    setSamplesError,
    apiService
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleViewProfile = () => {
    setShowProfileModal(true);
    setIsProfileDropdownOpen(false);
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Sample Providers' },
    { path: '/submit-sample', icon: Upload, label: 'Submit Sample' },
    { path: '/samples', icon: FlaskConical, label: 'My Samples' },
    { path: '/ledger', icon: BookOpen, label: 'Ledger' },
    { path: '/reports', icon: FileText, label: 'Reports' },
  ];

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-cyan-500 fixed top-0 left-0 right-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <div className="flex items-center space-x-3">
                <img src="/favicon.jpeg" alt="NSP Labs Logo" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">NSP Labs</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Analytical Labs Private Limited</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBell />
              
              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {/* User Info Section - Only visible on mobile (when header info is hidden) */}
                    <div className="px-4 py-3 border-b border-gray-200 sm:hidden">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleViewProfile}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-400" />
                        View Profile
                      </button>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t z-40">
            <div className="px-4 py-2">
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

      {/* Body */}
      <div className="flex pt-16">
        {/* Sidebar */}
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

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-6 xl:px-12 py-6">
          <SamplesProvider samples={samples} loading={samplesLoading} error={samplesError}>
            <Outlet />
          </SamplesProvider>
        </main>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-30" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
              <button
                onClick={handleCloseProfile}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <Profile />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
