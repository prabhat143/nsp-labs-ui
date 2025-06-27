import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserSamples, getUserReports } from '../utils/localStorage';
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
  
  const samples = getUserSamples(user?.id || '');
  const reports = getUserReports(user?.id || '');
  
  const pendingSamples = samples.filter(s => s.status === 'pending').length;
  const testingSamples = samples.filter(s => s.status === 'testing').length;
  const completedSamples = samples.filter(s => s.status === 'completed').length;
  const successfulTests = reports.filter(r => r.result === 'success').length;

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
      description: `Access your ${reports.length} completed test reports`,
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
    },
    {
      label: 'Testing in Progress',
      value: testingSamples,
      icon: FlaskConical,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Completed Tests',
      value: completedSamples,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Success Rate',
      value: reports.length > 0 ? `${Math.round((successfulTests / reports.length) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-6 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-cyan-100 text-base lg:text-lg">
          Your shrimp testing dashboard is ready. What would you like to do today?
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-shadow">
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
            {samples.slice(0, 3).map((sample) => (
              <div key={sample.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    sample.status === 'completed' ? 'bg-green-100' :
                    sample.status === 'testing' ? 'bg-blue-100' : 'bg-yellow-100'
                  }`}>
                    {sample.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : sample.status === 'testing' ? (
                      <FlaskConical className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{sample.location}</p>
                    <p className="text-sm text-gray-500">{sample.category}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-medium text-gray-900 capitalize">{sample.status}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(sample.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;