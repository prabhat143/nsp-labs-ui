import React from 'react';
import { RealtimeProvider } from './contexts/RealtimeContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import LoginRegister from './components/LoginRegister';
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import SubmitSample from './components/SubmitSample';
import SampleHistory from './components/SampleHistory';
import TestingTimeline from './components/TestingTimeline';
import ReportHistory from './components/ReportHistory';
import ReportDetails from './components/ReportDetails';
import Ledger from './components/Ledger';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import Careers from './components/Careers';
import Blog from './components/Blog';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};


function App() {
  return (
    <RealtimeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginRegister />
                  </PublicRoute>
                }
              />

              {/* Legal and Info Pages */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/blog" element={<Blog />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="submit-sample" element={<SubmitSample />} />
              <Route path="samples" element={<SampleHistory />} />
              <Route path="ledger" element={<Ledger />} />
              <Route path="timeline/:sampleId" element={<TestingTimeline />} />
              <Route path="reports" element={<ReportHistory />} />
              <Route path="report/:reportId" element={<ReportDetails />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
        </NotificationProvider>
      </AuthProvider>
    </RealtimeProvider>
  );
}

export default App;