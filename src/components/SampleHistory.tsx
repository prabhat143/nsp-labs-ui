import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserSamples } from '../utils/localStorage';
import { 
  FlaskConical, 
  Clock, 
  UserCheck, 
  TestTube, 
  CheckCircle,
  Eye,
  Calendar,
  FileText
} from 'lucide-react';

const SampleHistory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const samples = getUserSamples(user?.id || '');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'agent-assigned':
        return <UserCheck className="h-5 w-5 text-blue-600" />;
      case 'testing':
        return <TestTube className="h-5 w-5 text-purple-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'agent-assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'testing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Assignment';
      case 'agent-assigned':
        return 'Agent Assigned';
      case 'testing':
        return 'Testing in Progress';
      case 'completed':
        return 'Testing Complete';
      default:
        return status;
    }
  };

  const handleViewTimeline = (sampleId: string) => {
    navigate(`/timeline/${sampleId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <FlaskConical className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Sample History</h1>
            <p className="text-gray-600 text-sm lg:text-base">Track the status of all your submitted samples</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Samples', value: samples.length, color: 'bg-blue-100 text-blue-800' },
            { label: 'Pending', value: samples.filter(s => s.status === 'pending').length, color: 'bg-yellow-100 text-yellow-800' },
            { label: 'Testing', value: samples.filter(s => s.status === 'testing').length, color: 'bg-purple-100 text-purple-800' },
            { label: 'Completed', value: samples.filter(s => s.status === 'completed').length, color: 'bg-green-100 text-green-800' },
          ].map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-lg p-3 lg:p-4 text-center`}>
              <div className="text-lg lg:text-2xl font-bold">{stat.value}</div>
              <div className="text-xs lg:text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample List */}
      <div className="space-y-4">
        {samples.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-center">
            <FlaskConical className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">No Samples Yet</h3>
            <p className="text-gray-600 mb-6 text-sm lg:text-base">You haven't submitted any samples for testing.</p>
            <button
              onClick={() => navigate('/submit-sample')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors"
            >
              Submit Your First Sample
            </button>
          </div>
        ) : (
          samples.map((sample) => (
            <div key={sample.id} className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(sample.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(sample.status)}`}>
                        {getStatusLabel(sample.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Sample ID</h3>
                      <p className="text-gray-600 font-mono text-sm break-all">{sample.id}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                      <p className="text-gray-600 text-sm">{sample.location}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Category</h3>
                      <p className="text-gray-600 text-sm">{sample.category}</p>
                    </div>
                  </div>

                  {sample.subCategory && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-1">Sub-category</h3>
                      <p className="text-gray-600 text-sm">{sample.subCategory}</p>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Submitted on {new Date(sample.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 lg:ml-4">
                  {(sample.status === 'agent-assigned' || sample.status === 'testing' || sample.status === 'completed') && (
                    <button
                      onClick={() => handleViewTimeline(sample.id)}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Timeline</span>
                    </button>
                  )}
                  
                  {sample.status === 'completed' && (
                    <button
                      onClick={() => navigate('/reports')}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View Report</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SampleHistory;