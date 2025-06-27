import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserReports, getSamples } from '../utils/localStorage';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  Calendar,
  FlaskConical
} from 'lucide-react';

const ReportHistory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const reports = getUserReports(user?.id || '');
  const samples = getSamples();

  const getResultIcon = (result: string) => {
    return result === 'success' ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getResultColor = (result: string) => {
    return result === 'success' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getSampleInfo = (sampleId: string) => {
    return samples.find(s => s.id === sampleId);
  };

  const handleViewReport = (reportId: string) => {
    navigate(`/report/${reportId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Test Reports</h1>
            <p className="text-gray-600 text-sm lg:text-base">View and download your completed test reports</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { 
              label: 'Total Reports', 
              value: reports.length, 
              color: 'bg-blue-100 text-blue-800' 
            },
            { 
              label: 'Successful Tests', 
              value: reports.filter(r => r.result === 'success').length, 
              color: 'bg-green-100 text-green-800' 
            },
            { 
              label: 'Failed Tests', 
              value: reports.filter(r => r.result === 'failure').length, 
              color: 'bg-red-100 text-red-800' 
            },
          ].map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-lg p-3 lg:p-4 text-center`}>
              <div className="text-lg lg:text-2xl font-bold">{stat.value}</div>
              <div className="text-xs lg:text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-center">
            <FileText className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
            <p className="text-gray-600 mb-6 text-sm lg:text-base">
              Your test reports will appear here once testing is completed.
            </p>
            <button
              onClick={() => navigate('/samples')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors"
            >
              View Sample Status
            </button>
          </div>
        ) : (
          reports.map((report) => {
            const sampleInfo = getSampleInfo(report.sampleId);
            return (
              <div key={report.id} className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-2">
                        {getResultIcon(report.result)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getResultColor(report.result)}`}>
                          {report.result === 'success' ? 'Test Passed' : 'Test Failed'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Report ID</h3>
                        <p className="text-gray-600 font-mono text-sm break-all">{report.id}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Sample Location</h3>
                        <p className="text-gray-600 text-sm">{sampleInfo?.location || 'N/A'}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Sample Category</h3>
                        <p className="text-gray-600 text-sm">{sampleInfo?.category || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Preview of test results */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Test Summary</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Viral Screening:</span>
                          <span className="ml-2 text-gray-900">{report.details.labResults?.viralScreening || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Bacterial Analysis:</span>
                          <span className="ml-2 text-gray-900">{report.details.labResults?.bacterialAnalysis || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Parasite Check:</span>
                          <span className="ml-2 text-gray-900">{report.details.labResults?.parasiteCheck || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Genetic Markers:</span>
                          <span className="ml-2 text-gray-900">{report.details.labResults?.geneticMarkers || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      Completed on {new Date(report.completedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 lg:ml-4">
                    <button
                      onClick={() => handleViewReport(report.id)}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        // In a real app, this would trigger a download
                        alert('Download functionality would be implemented here');
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReportHistory;