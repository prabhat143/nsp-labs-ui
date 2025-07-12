import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSamples } from '../contexts/SamplesContext';
import {
  User,
  Upload,
  FlaskConical,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { samples, loading, error } = useSamples();

  const pendingSamples = samples.filter(s => {
    const status = s.status.toUpperCase();
    return status === 'PENDING' || status === 'COLLECTING';
  }).length;
  const collectedSamples = samples.filter(s => s.status.toUpperCase() === 'COLLECTED').length;
  const testingSamples = samples.filter(s => s.status.toUpperCase() === 'PROCESSING' || s.status.toUpperCase() === 'TESTING').length;
  const completedSamples = samples.filter(s => s.status.toUpperCase() === 'COMPLETED').length;
  const successfulTests = completedSamples;

  const dashboardCards = [
    {
      title: 'View Profile',
      description: 'Manage your account details and contact information',
      icon: User,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      onClick: () => navigate('/profile'),
    },
    {
      title: 'Submit Sample',
      description: 'Submit a new shrimp sample for testing',
      icon: Upload,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      onClick: () => navigate('/submit-sample'),
    },
    {
      title: 'Sample History',
      description: `View all ${samples.length} submitted samples and their status`,
      icon: FlaskConical,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      onClick: () => navigate('/samples'),
    },
    {
      title: 'Test Reports',
      description: `Access your ${completedSamples} completed test reports`,
      icon: FileText,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      onClick: () => navigate('/reports'),
    },
  ];

  const stats = [
    {
      label: 'Pending Samples',
      value: pendingSamples,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      onClick: () => navigate('/samples?status=pending'),
      clickable: pendingSamples > 0,
    },
    {
      label: 'Collected',
      value: collectedSamples,
      icon: Upload,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
      onClick: () => navigate('/samples?status=collected'),
      clickable: collectedSamples > 0,
    },
    {
      label: 'Testing in Progress',
      value: testingSamples,
      icon: FlaskConical,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      onClick: () => navigate('/samples?status=testing'),
      clickable: testingSamples > 0,
    },
    {
      label: 'Completed Tests',
      value: completedSamples,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      onClick: () => navigate('/samples?status=completed'),
      clickable: completedSamples > 0,
    },
    {
      label: 'Success Rate',
      value: completedSamples > 0 ? `${Math.round((successfulTests / completedSamples) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      onClick: () => navigate('/samples?status=completed'),
      clickable: completedSamples > 0,
    },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      <div className="max-w-screen-xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Loading Dashboard...</h3>
            <p className="text-gray-600 mb-4 text-sm">Please wait while we fetch your data.</p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-4 sm:p-6 text-white">
              <h1 className="text-xl sm:text-2xl font-bold mb-1">Welcome back, {user?.name}!</h1>
              <p className="text-sm sm:text-base">
                Your shrimp testing dashboard is ready. What would you like to do today?
              </p>
            </div>

            {/* Stats section: 5 tiles in a row on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  onClick={stat.clickable ? stat.onClick : undefined}
                  className={`bg-white rounded-xl p-3 sm:p-4 shadow-md ${
                    stat.clickable ? 'hover:shadow-lg cursor-pointer transform hover:scale-105 transition-all' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md ${stat.bgColor}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color} max-w-full`} />
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-gray-600 truncate">{stat.label}</p>
                      <p className="text-base font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Cards section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
              {dashboardCards.map((card, index) => (
                <div
                  key={index}
                  onClick={card.onClick}
                  className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${card.color} ${card.hoverColor} group-hover:scale-110 transform transition-all`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-cyan-600 transition-colors mb-1">
                        {card.title}
                      </h3>
                      <p className="text-sm text-gray-600">{card.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
