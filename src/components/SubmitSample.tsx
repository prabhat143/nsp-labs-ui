import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSamples, saveSamples, updateSampleStatus, getRandomAgent, createTestReport } from '../utils/localStorage';
import { Sample } from '../types';
import { Upload, MapPin, Tag, Users, CheckCircle, Clock, UserCheck, FlaskConical } from 'lucide-react';

const SubmitSample: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submittedSample, setSubmittedSample] = useState<Sample | null>(null);
  const [progressStage, setProgressStage] = useState<'submitted' | 'agent-assigned' | 'testing' | 'completed'>('submitted');
  const [assignedAgent, setAssignedAgent] = useState<string>('');
  
  const [formData, setFormData] = useState({
    location: '',
    category: '',
    subCategory: '',
    contactInfo: user?.email || '',
  });

  const locations = [
    'Miami Bay Farm #1',
    'Miami Bay Farm #2', 
    'Miami Bay Farm #3',
    'Gulf Coast Farm #1',
    'Gulf Coast Farm #2',
    'Atlantic Coast Farm #1',
    'Pacific Northwest Farm #1',
    'Caribbean Farm #1',
  ];

  const categories = [
    'Pacific White Shrimp',
    'Tiger Shrimp',
    'Black Tiger Shrimp',
    'Banana Shrimp',
    'Brown Shrimp',
    'Pink Shrimp',
  ];

  const subCategories = [
    'Juvenile Stock',
    'Adult Breeding Stock', 
    'Harvested Product',
    'Broodstock',
    'Post-Larvae',
  ];

  // Auto-progression effect
  useEffect(() => {
    if (!submitted || !submittedSample) return;

    const timers: NodeJS.Timeout[] = [];

    // Stage 1: Agent assignment after 30 seconds
    timers.push(setTimeout(() => {
      const agent = getRandomAgent();
      setAssignedAgent(agent);
      setProgressStage('agent-assigned');
      updateSampleStatus(submittedSample.id, 'agent-assigned', agent);
    }, 30000)); // 30 seconds

    // Stage 2: Testing starts after 1 minute
    timers.push(setTimeout(() => {
      setProgressStage('testing');
      updateSampleStatus(submittedSample.id, 'testing');
    }, 60000)); // 1 minute

    // Stage 3: Testing completes after 2 minutes
    timers.push(setTimeout(() => {
      setProgressStage('completed');
      updateSampleStatus(submittedSample.id, 'completed');
      createTestReport(submittedSample);
    }, 120000)); // 2 minutes

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [submitted, submittedSample]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSample: Sample = {
      id: Date.now().toString(),
      userId: user!.id,
      location: formData.location,
      category: formData.category,
      subCategory: formData.subCategory,
      contactInfo: formData.contactInfo,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    const samples = getSamples();
    samples.push(newSample);
    saveSamples(samples);
    
    setSubmittedSample(newSample);
    setSubmitted(true);
    setProgressStage('submitted');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'submitted':
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case 'agent-assigned':
        return <UserCheck className="h-6 w-6 text-blue-600" />;
      case 'testing':
        return <FlaskConical className="h-6 w-6 text-purple-600" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStageMessage = (stage: string) => {
    switch (stage) {
      case 'submitted':
        return 'Sample submitted successfully! Waiting for agent assignment...';
      case 'agent-assigned':
        return `Agent ${assignedAgent} has been assigned to your sample. Testing will begin shortly.`;
      case 'testing':
        return 'Laboratory testing is now in progress. This may take some time.';
      case 'completed':
        return 'Testing completed! Your results are now available.';
      default:
        return 'Processing your sample...';
    }
  };

  if (submitted && submittedSample) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {getStageIcon(progressStage)}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sample Processing</h1>
            <p className="text-gray-600">{getStageMessage(progressStage)}</p>
          </div>

          {/* Progress Timeline */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Progress</span>
              <span className="text-sm font-medium text-gray-500">
                {progressStage === 'submitted' && '25%'}
                {progressStage === 'agent-assigned' && '50%'}
                {progressStage === 'testing' && '75%'}
                {progressStage === 'completed' && '100%'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  progressStage === 'submitted' ? 'bg-yellow-500 w-1/4' :
                  progressStage === 'agent-assigned' ? 'bg-blue-500 w-1/2' :
                  progressStage === 'testing' ? 'bg-purple-500 w-3/4' :
                  'bg-green-500 w-full'
                }`}
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submission Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Sample ID</span>
                <p className="text-gray-900 font-mono">{submittedSample.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Submission Date</span>
                <p className="text-gray-900">{new Date(submittedSample.submittedAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Location</span>
                <p className="text-gray-900">{submittedSample.location}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Category</span>
                <p className="text-gray-900">{submittedSample.category}</p>
              </div>
              {submittedSample.subCategory && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Sub-category</span>
                  <p className="text-gray-900">{submittedSample.subCategory}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Current Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  progressStage === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                  progressStage === 'agent-assigned' ? 'bg-blue-100 text-blue-800' :
                  progressStage === 'testing' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {progressStage === 'submitted' && 'Waiting for assignment'}
                  {progressStage === 'agent-assigned' && 'Agent assigned'}
                  {progressStage === 'testing' && 'Testing in progress'}
                  {progressStage === 'completed' && 'Testing complete'}
                </span>
              </div>
            </div>

            {assignedAgent && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Assigned Agent: {assignedAgent}</span>
                </div>
              </div>
            )}
          </div>

          <div className={`border rounded-lg p-4 mb-8 ${
            progressStage === 'completed' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              progressStage === 'completed' ? 'text-green-900' : 'text-blue-900'
            }`}>
              {progressStage === 'completed' ? 'Testing Complete!' : 'What happens next?'}
            </h3>
            <ul className={`text-sm space-y-1 ${
              progressStage === 'completed' ? 'text-green-700' : 'text-blue-700'
            }`}>
              {progressStage === 'completed' ? (
                <>
                  <li>• Your test results are now available in the Reports section</li>
                  <li>• You can view detailed analysis and certification information</li>
                  <li>• Download or print your official test report</li>
                </>
              ) : (
                <>
                  <li>• {progressStage === 'submitted' ? 'An NSP Labs agent will be assigned within 30 seconds' : '✓ Agent assigned'}</li>
                  <li>• {['submitted', 'agent-assigned'].includes(progressStage) ? 'Laboratory testing will begin shortly' : '✓ Testing in progress'}</li>
                  <li>• You'll receive updates as testing progresses</li>
                  <li>• Results will be available upon completion</li>
                </>
              )}
            </ul>
          </div>

          <div className="flex space-x-4">
            {progressStage === 'completed' ? (
              <>
                <button
                  onClick={() => navigate('/reports')}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors font-medium"
                >
                  View Test Results
                </button>
                <button
                  onClick={() => navigate('/samples')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  View All Samples
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/samples')}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors font-medium"
                >
                  View All Samples
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back to Dashboard
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-cyan-500 px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Submit Sample for Testing</h1>
              <p className="text-green-100">Provide details about your shrimp sample</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Sample Location *
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Select a location</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Shrimp Category *
            </label>
            <select
              name="category" 
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub-category (Optional)
            </label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Select a sub-category</option>
              {subCategories.map((subCategory) => (
                <option key={subCategory} value={subCategory}>
                  {subCategory}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Contact Information *
            </label>
            <textarea
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Email address or additional contact details for this submission"
            />
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Important Notes:</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Ensure samples are properly preserved and labeled before submission</li>
              <li>• Testing typically takes 3-5 business days to complete</li>
              <li>• You will receive real-time updates throughout the testing process</li>
              <li>• Contact information is used for urgent communications only</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-lg hover:from-green-600 hover:to-cyan-600 transition-colors font-medium flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Submit Sample</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitSample;