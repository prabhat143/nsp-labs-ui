import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSamples, saveSamples } from '../utils/localStorage';
import { Sample } from '../types';
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
  const [sample, setSample] = useState<Sample | null>(null);

  useEffect(() => {
    const samples = getSamples();
    const foundSample = samples.find(s => s.id === sampleId && s.userId === user?.id);
    
    if (foundSample) {
      // Initialize progress if not set
      if (!foundSample.stageProgress) {
        foundSample.stageProgress = {
          stage1: foundSample.status !== 'pending',
          stage2: foundSample.status === 'completed',
          stage3: foundSample.status === 'completed',
        };
        foundSample.currentStage = foundSample.status === 'completed' ? 3 : 
                                   foundSample.status === 'testing' ? 2 : 1;
        
        // Update localStorage
        const updatedSamples = samples.map(s => s.id === sampleId ? foundSample : s);
        saveSamples(updatedSamples);
      }
      setSample(foundSample);
    } else {
      navigate('/samples');
    }
  }, [sampleId, user?.id, navigate]);

  if (!sample) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading sample information...</p>
        </div>
      </div>
    );
  }

  const stages = [
    {
      id: 1,
      title: 'Initial Inspection',
      description: 'Visual examination and preliminary assessment of the sample',
      icon: Eye,
      completed: sample.stageProgress?.stage1 || false,
      current: sample.currentStage === 1,
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
      completed: sample.stageProgress?.stage2 || false,
      current: sample.currentStage === 2,
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
      completed: sample.stageProgress?.stage3 || false,
      current: sample.currentStage === 3,
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
          
          <div className="text-left sm:text-right">
            <p className="text-sm text-gray-500">Sample ID</p>
            <p className="font-mono text-base lg:text-lg font-semibold text-gray-900 break-all">{sample.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
            <p className="text-gray-600 text-sm">{sample.location}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Category</h3>
            <p className="text-gray-600 text-sm">{sample.category}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Submitted</h3>
            <p className="text-gray-600 text-sm">{new Date(sample.submittedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {sample.agentId && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900 text-sm lg:text-base">Assigned Agent: {sample.agentId}</span>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-8">Testing Progress</h2>
        
        <div className="space-y-8">
          {stages.map((stage, index) => {
            const status = getStageStatus(stage);
            const isLast = index === stages.length - 1;
            
            return (
              <div key={stage.id} className="relative">
                {/* Progress Line */}
                {!isLast && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200">
                    <div 
                      className={`w-full transition-all duration-500 ${
                        status === 'completed' ? 'bg-green-500 h-full' : 
                        status === 'current' ? 'bg-blue-500 h-1/2' : 'h-0'
                      }`}
                    />
                  </div>
                )}

                <div className="flex items-start space-x-6">
                  {/* Stage Icon */}
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${getStageColor(status)}`}>
                    {status === 'completed' ? (
                      <CheckCircle className="h-6 w-6 text-white" />
                    ) : status === 'current' ? (
                      <Clock className="h-6 w-6 text-white animate-pulse" />
                    ) : (
                      <stage.icon className={`h-6 w-6 ${getIconColor(status)}`} />
                    )}
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                      <h3 className="text-lg lg:text-xl font-semibold text-gray-900">{stage.title}</h3>
                      {status === 'completed' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full self-start">
                          Completed
                        </span>
                      )}
                      {status === 'current' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full self-start">
                          In Progress
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4 text-sm lg:text-base">{stage.description}</p>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Stage Activities:</h4>
                      <ul className="space-y-1">
                        {stage.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <div className={`w-2 h-2 rounded-full mr-3 ${
                              status === 'completed' ? 'bg-green-500' :
                              status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                            }`} />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {sample.status === 'completed' && (
          <div className="mt-8 p-4 lg:p-6 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-base lg:text-lg font-semibold text-green-900">Testing Complete!</h3>
            </div>
            <p className="text-green-700 mb-4 text-sm lg:text-base">
              Your shrimp sample has successfully completed all testing stages. The detailed report is now available.
            </p>
            <button
              onClick={() => navigate('/reports')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              View Detailed Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestingTimeline;