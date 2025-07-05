import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/favicon.jpeg" 
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-white">
            <div className="flex items-center space-x-4 mb-4">
              <Scale className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold">Terms of Service</h1>
                <p className="text-indigo-100">Last updated: January 2024</p>
              </div>
            </div>
            <p className="text-lg text-indigo-100">
              Please read these terms carefully before using our laboratory testing services.
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-12 space-y-8">
            {/* Acceptance of Terms */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
              </div>
              <div className="text-gray-700 space-y-3">
                <p>
                  By accessing and using NSP Analytical Labs Private Limited's services, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
                <p>
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>
            </section>

            {/* Service Description */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Service Description</h2>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>NSP Labs provides comprehensive analytical testing services for aquaculture, including:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Shrimp disease testing and health assessment</li>
                  <li>Water quality analysis</li>
                  <li>Antibiotic residue testing</li>
                  <li>Dye contamination detection</li>
                  <li>Sodium level analysis</li>
                  <li>Microbiological testing</li>
                </ul>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-indigo-800">
                    <strong>Accreditation:</strong> Our laboratory is ISO 17025 accredited and follows international testing standards.
                  </p>
                </div>
              </div>
            </section>

            {/* Sample Submission Terms */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Sample Submission & Testing</h2>
              </div>
              <div className="text-gray-700 space-y-4">
                <h3 className="text-lg font-semibold">Sample Requirements</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Samples must be properly preserved and labeled</li>
                  <li>Minimum sample quantities as specified for each test</li>
                  <li>Samples should be submitted within recommended timeframes</li>
                  <li>Chain of custody documentation must be complete</li>
                </ul>
                
                <h3 className="text-lg font-semibold">Testing Timeline</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Standard testing: 3-5 business days</li>
                  <li>Rush testing: 24-48 hours (additional charges apply)</li>
                  <li>Complex analysis: 5-7 business days</li>
                  <li>Timelines may vary based on test complexity and sample condition</li>
                </ul>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Scale className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Payment Terms</h2>
              </div>
              <div className="text-gray-700 space-y-3">
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Payment is due upon sample submission unless credit terms are pre-approved</li>
                  <li>We accept cash, bank transfers, and approved credit arrangements</li>
                  <li>Late payment charges may apply for overdue accounts</li>
                  <li>Prices are subject to change with 30 days notice</li>
                  <li>Additional charges may apply for rush testing or special handling</li>
                </ul>
              </div>
            </section>

            {/* Liability and Limitations */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Liability & Limitations</h2>
              </div>
              <div className="text-gray-700 space-y-4">
                <h3 className="text-lg font-semibold">Our Responsibility</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We maintain professional standards and quality control</li>
                  <li>Results are based on samples as received</li>
                  <li>We are not responsible for sample collection or preservation issues</li>
                  <li>Our liability is limited to the cost of retesting</li>
                </ul>
                
                <h3 className="text-lg font-semibold">Client Responsibility</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Proper sample collection and preservation</li>
                  <li>Accurate information about sample origin and history</li>
                  <li>Compliance with safety and regulatory requirements</li>
                  <li>Timely payment of testing fees</li>
                </ul>
              </div>
            </section>

            {/* Confidentiality */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Confidentiality</h2>
              </div>
              <div className="text-gray-700 space-y-3">
                <p>
                  We maintain strict confidentiality of all client information and test results. 
                  Information will only be disclosed:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>With written client authorization</li>
                  <li>As required by law or regulatory authorities</li>
                  <li>For quality assurance and accreditation purposes (anonymized)</li>
                </ul>
              </div>
            </section>

            {/* Dispute Resolution */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <XCircle className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Dispute Resolution</h2>
              </div>
              <div className="text-gray-700 space-y-3">
                <p>
                  Any disputes arising from our services will be resolved through:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Direct negotiation between parties</li>
                  <li>Mediation if negotiation fails</li>
                  <li>Arbitration under Indian Arbitration laws</li>
                  <li>Jurisdiction: Courts of Bhimavaram, West Godavari, Andhra Pradesh</li>
                </ul>
              </div>
            </section>

            {/* Modifications */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Modifications</h2>
              </div>
              <div className="text-gray-700 space-y-3">
                <p>
                  NSP Labs reserves the right to modify these terms at any time. 
                  Clients will be notified of significant changes via email or website notice. 
                  Continued use of our services constitutes acceptance of modified terms.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">📧 nsplabs03@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">📞 +91 9740579955</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-gray-700">
                    📍 NSP Labs 2nd floor, 1-1-32/3, Vijaylaxmi Estates,<br />
                    JP Road, Julupalem, Bhimavaram,<br />
                    West Godavari, Andhra Pradesh - 534202
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;