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

const DashboardDesktopView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { samples, loading, error } = useSamples();
  
  // Calculate statistics from API data
  const pendingSamples = samples.filter(s => {
    const status = s.status.toUpperCase();
    return status === 'PENDING' || status === 'COLLECTING';
  }).length;
  const collectedSamples = samples.filter(s => s.status.toUpperCase() === 'COLLECTED').length;
  const testingSamples = samples.filter(s => s.status.toUpperCase() === 'PROCESSING' || s.status.toUpperCase() === 'TESTING').length;
  const completedSamples = samples.filter(s => s.status.toUpperCase() === 'COMPLETED').length;
  const successfulTests = completedSamples; // Assuming completed means successful for now

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
    <div className="space-y-6 lg:space-y-8">
      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-center">
          <FlaskConical className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h3>
          <p className="text-gray-600 mb-6 text-sm lg:text-base">Please wait while we fetch your data.</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-center">
          <AlertTriangle className="h-12 w-12 lg:h-16 lg:w-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-6 text-sm lg:text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Dashboard Content */}
      {!loading && !error && (
        <>
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-6 lg:p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
                <p className="text-cyan-100 text-base lg:text-lg">
                  Your shrimp testing dashboard is ready. What would you like to do today?
                </p>
              </div>
            </div>
          </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            onClick={stat.clickable ? stat.onClick : undefined}
            className={`bg-white rounded-xl p-4 lg:p-6 shadow-lg transition-all duration-200 ${
              stat.clickable 
                ? 'hover:shadow-xl hover:scale-105 cursor-pointer transform' 
                : ''
            }`}
          >
            <div className="flex items-center">
              <div className={`p-2 lg:p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 lg:h-6 lg:w-6 ${stat.color}`} />
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">{stat.label}</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            onClick={card.onClick}
            className="bg-white rounded-xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 lg:p-4 rounded-xl ${card.color} ${card.hoverColor} transition-colors group-hover:scale-110 transform duration-200`}>
                <card.icon className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {samples.length > 0 && (
        <div className="bg-white rounded-xl p-6 lg:p-8 shadow-lg">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {samples
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 3)
              .map((sample) => (
              <div key={sample.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    sample.status.toUpperCase() === 'COMPLETED' ? 'bg-green-100' :
                    sample.status.toUpperCase() === 'PROCESSING' || sample.status.toUpperCase() === 'TESTING' ? 'bg-blue-100' : 'bg-yellow-100'
                  }`}>
                    {sample.status.toUpperCase() === 'COMPLETED' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : sample.status.toUpperCase() === 'PROCESSING' || sample.status.toUpperCase() === 'TESTING' ? (
                      <FlaskConical className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{sample.samplerLocation}</p>
                    <p className="text-sm text-gray-500">{sample.shrimpCategory}</p>
                    <p className="text-xs text-gray-400 font-mono">ID: {sample.id}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {sample.status.toUpperCase() === 'PROCESSING' || sample.status.toUpperCase() === 'TESTING' ? 'Testing' : sample.status.toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(sample.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default DashboardDesktopView;