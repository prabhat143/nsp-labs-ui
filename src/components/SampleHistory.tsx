import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { SampleSubmission } from '../types';
import { 
  FlaskConical, 
  Clock, 
  TestTube, 
  CheckCircle,
  Eye,
  Calendar,
  FileText,
  MapPin,
  Tag,
  User
} from 'lucide-react';

const SampleHistory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [samples, setSamples] = useState<SampleSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    const statusFilter = searchParams.get('status');
    if (statusFilter) {
      setActiveFilter(statusFilter);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchSamples = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const sampleSubmissions = await apiService.getSampleSubmissions(user.id);
        setSamples(sampleSubmissions);
      } catch (err) {
        console.error('Failed to fetch sample submissions:', err);
        setError('Failed to load sample history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSamples();
  }, [user?.id]);

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'PROCESSING':
      case 'TESTING':
        return <TestTube className="h-5 w-5 text-purple-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PROCESSING':
      case 'TESTING':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Pending';
      case 'PROCESSING':
      case 'TESTING':
        return 'Testing';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleViewTimeline = (sampleId: string) => {
    navigate(`/timeline/${sampleId}`);
  };

  // Filter samples based on active filter
  const getFilteredSamples = () => {
    switch (activeFilter) {
      case 'pending':
        return samples.filter(s => s.status.toUpperCase() === 'PENDING');
      case 'testing':
        return samples.filter(s => s.status.toUpperCase() === 'PROCESSING' || s.status.toUpperCase() === 'TESTING');
      case 'completed':
        return samples.filter(s => s.status.toUpperCase() === 'COMPLETED');
      default:
        return samples;
    }
  };

  const filteredSamples = getFilteredSamples();

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
            { 
              label: 'Total Samples', 
              value: samples.length, 
              color: 'bg-blue-100 text-blue-800',
              filterKey: 'all',
              clickable: true
            },
            { 
              label: 'Pending', 
              value: samples.filter(s => s.status.toUpperCase() === 'PENDING').length, 
              color: 'bg-yellow-100 text-yellow-800',
              filterKey: 'pending',
              clickable: samples.filter(s => s.status.toUpperCase() === 'PENDING').length > 0
            },
            { 
              label: 'Testing', 
              value: samples.filter(s => s.status.toUpperCase() === 'PROCESSING' || s.status.toUpperCase() === 'TESTING').length, 
              color: 'bg-purple-100 text-purple-800',
              filterKey: 'testing',
              clickable: samples.filter(s => s.status.toUpperCase() === 'PROCESSING' || s.status.toUpperCase() === 'TESTING').length > 0
            },
            { 
              label: 'Completed', 
              value: samples.filter(s => s.status.toUpperCase() === 'COMPLETED').length, 
              color: 'bg-green-100 text-green-800',
              filterKey: 'completed',
              clickable: samples.filter(s => s.status.toUpperCase() === 'COMPLETED').length > 0
            },
          ].map((stat, index) => (
            <div 
              key={index} 
              onClick={stat.clickable ? () => setActiveFilter(stat.filterKey) : undefined}
              className={`${stat.color} rounded-lg p-3 lg:p-4 text-center transition-all duration-200 ${
                stat.clickable 
                  ? 'cursor-pointer hover:scale-105 transform hover:shadow-md' 
                  : ''
              } ${
                activeFilter === stat.filterKey 
                  ? 'ring-2 ring-blue-500 ring-offset-2' 
                  : ''
              }`}
            >
              <div className="text-lg lg:text-2xl font-bold">{stat.value}</div>
              <div className="text-xs lg:text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-center">
            <FlaskConical className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Loading Sample History...</h3>
            <p className="text-gray-600 mb-6 text-sm lg:text-base">Please wait while we fetch your samples.</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-center">
            <FlaskConical className="h-12 w-12 lg:h-16 lg:w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Error Loading Samples</h3>
            <p className="text-red-600 mb-6 text-sm lg:text-base">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : samples.length === 0 ? (
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
        ) : filteredSamples.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-center">
            <FlaskConical className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">No {activeFilter === 'all' ? '' : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Samples</h3>
            <p className="text-gray-600 mb-6 text-sm lg:text-base">
              {activeFilter === 'all' 
                ? 'No samples found.' 
                : `You don't have any ${activeFilter} samples at the moment.`}
            </p>
            <button
              onClick={() => setActiveFilter('all')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors"
            >
              View All Samples
            </button>
          </div>
        ) : (
          filteredSamples.map((sample) => (
            <div key={sample.id} className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(sample.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(sample.status)}`}>
                        {getStatusLabel(sample.status)}
                      </span>
                      {(sample.status.toUpperCase() === 'PROCESSING' || sample.status.toUpperCase() === 'TESTING') && (
                        <div className="relative group">
                          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200 cursor-pointer hover:bg-blue-200 transition-colors flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>Agent Assigned</span>
                          </span>
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            <div className="font-medium">Agent #001 - Lab Technician</div>
                            <div className="text-gray-300">Dr. Sarah Johnson</div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Sample ID</h3>
                      <p className="text-gray-600 font-mono text-sm break-all">{sample.id}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Location
                      </h3>
                      <p className="text-gray-600 text-sm">{sample.samplerLocation}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        Category
                      </h3>
                      <p className="text-gray-600 text-sm">{sample.shrimpCategory}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Sub-category</h3>
                    <p className="text-gray-600 text-sm">{sample.shrimpSubCategory}</p>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    Submitted on {new Date(sample.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>

                  {/* View Details Section */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium text-sm">
                      View Details
                    </summary>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Sampler Name:</span>
                          <span className="ml-2 text-gray-600">{sample.samplerName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Phone Number:</span>
                          <span className="ml-2 text-gray-600">{sample.phoneNumber}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Email:</span>
                          <span className="ml-2 text-gray-600">{sample.emailAddress || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Coordinates:</span>
                          <span className="ml-2 text-gray-600">
                            {sample.coordinate.lat.toFixed(6)}, {sample.coordinate.lng.toFixed(6)}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700">Last Updated:</span>
                          <span className="ml-2 text-gray-600">
                            {new Date(sample.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                <div className="flex flex-col space-y-2 lg:ml-4">
                  {(sample.status.toUpperCase() === 'PROCESSING' || sample.status.toUpperCase() === 'TESTING' || sample.status.toUpperCase() === 'COMPLETED') && (
                    <button
                      onClick={() => handleViewTimeline(sample.id)}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Timeline</span>
                    </button>
                  )}
                  
                  {sample.status.toUpperCase() === 'COMPLETED' && (
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