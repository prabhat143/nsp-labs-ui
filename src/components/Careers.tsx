import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  MapPin, 
  Clock, 
  DollarSign, 
  GraduationCap,
  Briefcase,
  Heart,
  Award,
  TrendingUp,
  Mail,
  Phone,
  Send
} from 'lucide-react';

const Careers: React.FC = () => {
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    education: '',
    coverLetter: ''
  });

  const jobOpenings = [
    {
      id: '1',
      title: 'Senior Marine Biologist',
      department: 'Laboratory Operations',
      location: 'Bhimavaram, Andhra Pradesh',
      type: 'Full-time',
      experience: '5+ years',
      salary: '₹8-12 LPA',
      description: 'Lead aquaculture research and testing protocols. Oversee sample analysis and quality control procedures.',
      requirements: [
        'M.Sc/Ph.D in Marine Biology or related field',
        '5+ years experience in aquaculture testing',
        'Knowledge of shrimp disease diagnostics',
        'Experience with laboratory management',
        'Strong analytical and communication skills'
      ],
      responsibilities: [
        'Develop and validate testing methodologies',
        'Supervise laboratory technicians',
        'Ensure compliance with quality standards',
        'Prepare technical reports and documentation',
        'Collaborate with clients on testing requirements'
      ]
    },
    {
      id: '2',
      title: 'Laboratory Technician',
      department: 'Testing & Analysis',
      location: 'Bhimavaram, Andhra Pradesh',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '₹3-5 LPA',
      description: 'Perform routine laboratory tests and maintain equipment. Support senior staff in complex analyses.',
      requirements: [
        'B.Sc in Biology, Chemistry, or related field',
        '2+ years laboratory experience',
        'Knowledge of analytical instruments',
        'Attention to detail and accuracy',
        'Good documentation skills'
      ],
      responsibilities: [
        'Conduct sample testing procedures',
        'Maintain laboratory equipment',
        'Record and document test results',
        'Follow safety and quality protocols',
        'Assist in method development'
      ]
    },
    {
      id: '3',
      title: 'Quality Assurance Manager',
      department: 'Quality Control',
      location: 'Bhimavaram, Andhra Pradesh',
      type: 'Full-time',
      experience: '6+ years',
      salary: '₹10-15 LPA',
      description: 'Oversee quality management systems and ensure ISO 17025 compliance. Lead quality improvement initiatives.',
      requirements: [
        'M.Sc in relevant field with quality management certification',
        '6+ years in quality assurance',
        'ISO 17025 experience required',
        'Strong leadership and project management skills',
        'Knowledge of regulatory requirements'
      ],
      responsibilities: [
        'Maintain ISO 17025 accreditation',
        'Develop quality control procedures',
        'Conduct internal audits',
        'Train staff on quality standards',
        'Manage customer complaints and corrective actions'
      ]
    },
    {
      id: '4',
      title: 'Business Development Executive',
      department: 'Sales & Marketing',
      location: 'Bhimavaram, Andhra Pradesh',
      type: 'Full-time',
      experience: '3-5 years',
      salary: '₹4-7 LPA + Incentives',
      description: 'Drive business growth by developing client relationships and expanding market presence in aquaculture sector.',
      requirements: [
        'MBA/B.Tech with sales experience',
        '3+ years in B2B sales, preferably aquaculture',
        'Strong communication and negotiation skills',
        'Willingness to travel',
        'Understanding of laboratory services'
      ],
      responsibilities: [
        'Identify and develop new business opportunities',
        'Maintain relationships with existing clients',
        'Prepare proposals and presentations',
        'Achieve sales targets and KPIs',
        'Represent company at industry events'
      ]
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance and wellness programs'
    },
    {
      icon: GraduationCap,
      title: 'Learning & Development',
      description: 'Continuous training and professional development opportunities'
    },
    {
      icon: Award,
      title: 'Recognition Programs',
      description: 'Performance-based rewards and recognition initiatives'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Clear career progression paths and leadership opportunities'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setApplicationForm({
      ...applicationForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would submit to a backend
    alert('Thank you for your application! We will review it and get back to you soon.');
    setApplicationForm({
      name: '',
      email: '',
      phone: '',
      position: '',
      experience: '',
      education: '',
      coverLetter: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/WhatsApp Image 2025-05-18 at 1.21.28 PM.jpeg" 
                alt="NSP Labs Logo" 
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">NSP Labs</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Analytical Labs Private Limited</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-green-600 to-cyan-600 px-8 py-16 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <Users className="h-16 w-16" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
              <p className="text-xl text-green-100 mb-8">
                Be part of India's leading aquaculture testing laboratory and help shape the future of sustainable aquaculture
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold">15+</div>
                  <div className="text-green-100">Years of Excellence</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-green-100">Team Members</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-green-100">Satisfied Clients</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Work With Us */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Why Work With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Job Openings */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Current Openings</h2>
          <div className="space-y-6">
            {jobOpenings.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                    className="mt-4 lg:mt-0 bg-gradient-to-r from-green-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-cyan-600 transition-colors"
                  >
                    {selectedJob === job.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
                
                <p className="text-gray-700 mb-4">{job.description}</p>
                
                {selectedJob === job.id && (
                  <div className="border-t border-gray-200 pt-4 space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {job.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Responsibilities:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {job.responsibilities.map((resp, index) => (
                          <li key={index}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Apply Now</h2>
          <form onSubmit={handleSubmitApplication} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={applicationForm.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={applicationForm.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={applicationForm.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position Applied For *</label>
                <select
                  name="position"
                  value={applicationForm.position}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a position</option>
                  {jobOpenings.map((job) => (
                    <option key={job.id} value={job.title}>{job.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                <input
                  type="text"
                  name="experience"
                  value={applicationForm.experience}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 3 years"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Highest Education *</label>
                <input
                  type="text"
                  name="education"
                  value={applicationForm.education}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., M.Sc Marine Biology"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter *</label>
              <textarea
                name="coverLetter"
                value={applicationForm.coverLetter}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Please attach your resume and relevant certificates by emailing them to 
                <strong> nsplabs03@gmail.com</strong> with the subject line "Application for [Position Name] - [Your Name]"
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-cyan-600 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Send className="h-5 w-5" />
              <span>Submit Application</span>
            </button>
          </form>

          {/* Contact Information */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions about careers?</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">nsplabs03@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">+91 9740579955</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;