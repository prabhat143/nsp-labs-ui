import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSamples } from '../contexts/SamplesContext';
import { SampleSubmission } from '../types';
import { 
  ArrowLeft, 
  Eye, 
  FlaskConical, 
  FileCheck, 
  CheckCircle, 
  Clock,
  User
} from 'lucide-react';

const TestingTimeline: React.FC = () => {
  const { sampleId } = useParams<{ sampleId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { samples, loading, error } = useSamples();
  const [sample, setSample] = useState<SampleSubmission | null>(null);

  useEffect(() => {
    if (loading || !samples) return;
    
    const foundSample = samples.find(s => s.id === sampleId && s.consumerId === user?.id);
    
    if (foundSample) {
      setSample(foundSample);
    } else {
      navigate('/samples');
    }
  }, [sampleId, user?.id, navigate, samples, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600">Error loading timeline: {error}</p>
          <button
            onClick={() => navigate('/samples')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Samples
          </button>
        </div>
      </div>
    );
  }

  if (!sample) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Sample not found</p>
          <button
            onClick={() => navigate('/samples')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Samples
          </button>
        </div>
      </div>
    );
  }

  // Map SampleSubmission status to stage progress
  const getStageProgress = (status: string) => {
    const upperStatus = status.toUpperCase();
    return {
      stage1: upperStatus !== 'PENDING',
      stage2: upperStatus === 'TESTING' || upperStatus === 'COMPLETED',
      stage3: upperStatus === 'COMPLETED'
    };
  };

  const getCurrentStage = (status: string) => {
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'COMPLETED') return 3;
    if (upperStatus === 'TESTING' || upperStatus === 'PROCESSING') return 2;
    return 1;
  };

  const stageProgress = getStageProgress(sample.status);
  const currentStage = getCurrentStage(sample.status);

  const stages = [
    {
      id: 1,
      title: 'Initial Inspection',
      description: 'Visual examination and preliminary assessment of the sample',
      icon: Eye,
      completed: stageProgress.stage1,
      current: currentStage === 1,
      details: [
        'Sample receipt confirmation',
        'Visual quality assessment',
        'Physical condition evaluation',
        'Documentation and labeling verification'
      ]
    },
    {
      id: 2,
      title: 'Laboratory Testing',
      description: 'Comprehensive laboratory analysis and testing procedures',
      icon: FlaskConical,
      completed: stageProgress.stage2,
      current: currentStage === 2,
      details: [
        'Viral screening (WSSV, IHHNV, TSV)',
        'Bacterial analysis',
        'Parasite examination',
        'Genetic marker confirmation',
        'Quality metrics evaluation'
      ]
    },
    {
      id: 3,
      title: 'Final Review and Certification',
      description: 'Results compilation and quality certification',
      icon: FileCheck,
      completed: stageProgress.stage3,
      current: currentStage === 3,
      details: [
        'Results analysis and verification',
        'Quality standards compliance check',
        'Certification document preparation',
        'Final report generation'
      ]
    }
  ];

  const getStageStatus = (stage: typeof stages[0]) => {
    if (stage.completed) return 'completed';
    if (stage.current) return 'current';
    return 'pending';
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500';
      case 'current':
        return 'bg-blue-500 border-blue-500';
      default:
        return 'bg-gray-300 border-gray-300';
    }
  };

  const getIconColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-white';
      case 'current':
        return 'text-white';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <button
            onClick={() => navigate('/samples')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors self-start"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Samples</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">Sample ID: {sample.id}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Testing Timeline</h1>
          <p className="text-gray-600 mb-4">Track the progress of your shrimp sample through our comprehensive testing process.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Location:</span>
              <p className="text-gray-600">{sample.samplerLocation}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Category:</span>
              <p className="text-gray-600">{sample.shrimpCategory}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Submitted:</span>
              <p className="text-gray-600">{new Date(sample.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-8">
            {stages.map((stage) => {
              const status = getStageStatus(stage);
              const IconComponent = stage.icon;
              
              return (
                <div key={stage.id} className="relative flex items-start space-x-6">
                  {/* Timeline dot */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full border-4 flex items-center justify-center ${getStageColor(status)}`}>
                    <IconComponent className={`h-8 w-8 ${getIconColor(status)}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{stage.title}</h3>
                      <div className="flex items-center space-x-2">
                        {status === 'completed' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {status === 'current' && (
                          <Clock className="h-5 w-5 text-blue-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          status === 'completed' ? 'text-green-600' : 
                          status === 'current' ? 'text-blue-600' : 
                          'text-gray-500'
                        }`}>
                          {status === 'completed' ? 'Completed' : 
                           status === 'current' ? 'In Progress' : 
                           'Pending'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{stage.description}</p>
                    
                    {/* Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Process Details:</h4>
                      <ul className="space-y-1">
                        {stage.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className={`w-2 h-2 rounded-full ${
                              status === 'completed' ? 'bg-green-500' : 
                              status === 'current' ? 'bg-blue-500' : 
                              'bg-gray-300'
                            }`}></div>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Status</h2>
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className={`w-3 h-3 rounded-full ${
            sample.status === 'COMPLETED' ? 'bg-green-500' : 
            sample.status === 'TESTING' || sample.status === 'PROCESSING' ? 'bg-blue-500' : 
            'bg-yellow-500'
          }`}></div>
          <div>
            <p className="font-medium text-gray-900">
              {sample.status === 'COMPLETED' ? 'Testing Complete' : 
               sample.status === 'TESTING' ? 'Currently Testing' : 
               sample.status === 'PROCESSING' ? 'Processing Sample' : 
               'Sample Received'}
            </p>
            <p className="text-sm text-gray-600">
              Last updated: {new Date(sample.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestingTimeline;