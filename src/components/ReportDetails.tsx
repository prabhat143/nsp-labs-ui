import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getReports, getSamples } from '../utils/localStorage';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Calendar,
  Award,
  FlaskConical,
  Eye,
  Microscope
} from 'lucide-react';

const ReportDetails: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const reports = getReports();
  const samples = getSamples();
  const report = reports.find(r => r.id === reportId && r.userId === user?.id);
  const sample = report ? samples.find(s => s.id === report.sampleId) : null;

  if (!report || !sample) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-center">
          <FileText className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Report Not Found</h3>
          <p className="text-gray-600 mb-6 text-sm lg:text-base">The requested report could not be found.</p>
          <button
            onClick={() => navigate('/reports')}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const getResultIcon = (result: string) => {
    return result === 'success' ? (
      <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
    ) : (
      <XCircle className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
    );
  };

  const getResultColor = (result: string) => {
    return result === 'success' 
      ? 'from-green-500 to-emerald-500'
      : 'from-red-500 to-rose-500';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors self-start"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Reports</span>
          </button>
          
          <div className="text-left sm:text-right">
            <p className="text-sm text-gray-500">Report ID</p>
            <p className="font-mono text-base lg:text-lg font-semibold text-gray-900 break-all">{report.id}</p>
          </div>
        </div>

        {/* Result Banner */}
        <div className={`bg-gradient-to-r ${getResultColor(report.result)} rounded-2xl p-6 lg:p-8 text-white mb-8`}>
          <div className="flex items-center space-x-4">
            {getResultIcon(report.result)}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                {report.result === 'success' ? 'Test Successful' : 'Test Failed'}
              </h1>
              <p className="text-base lg:text-lg opacity-90">
                {report.result === 'success' 
                  ? 'Sample meets all quality standards and requirements'
                  : 'Sample did not meet the required quality standards'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Sample Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Completed</h3>
            <p className="text-gray-600 text-sm">{new Date(report.completedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Test Details */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Initial Inspection */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">Initial Inspection</h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-sm lg:text-base">{report.details.initialInspection}</p>
        </div>

        {/* Laboratory Results */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Microscope className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">Laboratory Results</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(report.details.labResults).map(([key, value]) => (
              <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg space-y-1 sm:space-y-0">
                <span className="font-medium text-gray-700 capitalize text-sm lg:text-base">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="text-gray-900 text-sm lg:text-base">{value as string}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final Review */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FlaskConical className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-gray-900">Final Review</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-6 text-sm lg:text-base">{report.details.finalReview}</p>
        
        {/* Certification */}
        {report.details.certification && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Award className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600" />
              <h3 className="text-base lg:text-lg font-semibold text-yellow-900">Certification</h3>
            </div>
            <p className="text-yellow-800 font-medium text-sm lg:text-base">{report.details.certification}</p>
          </div>
        )}
      </div>

      {/* Report Footer */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-5 w-5" />
            <span className="text-sm lg:text-base">Report generated on {new Date(report.completedAt).toLocaleString()}</span>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => {
                // In a real app, this would trigger a download
                alert('Download functionality would be implemented here');
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Download PDF
            </button>
            <button
              onClick={() => {
                // In a real app, this would trigger printing
                window.print();
              }}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors text-sm"
            >
              Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;