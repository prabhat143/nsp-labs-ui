import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Mail, Phone } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src="/favicon.jpeg" 
                alt="NSP Labs Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
              />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">NSP Labs</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Analytical Labs Private Limited</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Back to Home</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 sm:px-8 py-8 sm:py-12 text-white">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
              <Shield className="h-8 w-8 sm:h-12 sm:w-12" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Privacy Policy</h1>
                <p className="text-blue-100 text-sm sm:text-base">Last updated: January 2024</p>
              </div>
            </div>
            <p className="text-base sm:text-lg text-blue-100">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
            {/* Information We Collect */}
            <section>
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <Database className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Information We Collect</h2>
              </div>
              <div className="space-y-3 sm:space-y-4 text-gray-700">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm sm:text-base">
                    <li>Name, email address, and phone number</li>
                    <li>Company information and business address</li>
                    <li>Sample submission details and testing requirements</li>
                    <li>Payment and billing information</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Technical Information</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm sm:text-base">
                    <li>IP address and browser information</li>
                    <li>Device type and operating system</li>
                    <li>Usage patterns and preferences</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>
              <div className="space-y-3 text-gray-700 text-sm sm:text-base">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Process and manage your sample testing requests</li>
                  <li>Communicate test results and updates</li>
                  <li>Provide customer support and technical assistance</li>
                  <li>Improve our services and develop new testing capabilities</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Send important notifications about your account</li>
                </ul>
              </div>
            </section>

            {/* Data Protection */}
            <section>
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Data Protection & Security</h2>
              </div>
              <div className="space-y-3 sm:space-y-4 text-gray-700">
                <p className="text-sm sm:text-base">We implement industry-standard security measures to protect your data:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm sm:text-base">
                  <li>SSL encryption for all data transmission</li>
                  <li>Secure servers with regular security updates</li>
                  <li>Access controls and authentication protocols</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Employee training on data protection practices</li>
                </ul>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <p className="text-blue-800 text-sm sm:text-base">
                    <strong>Laboratory Data:</strong> All test results and sample data are stored securely 
                    and are only accessible to authorized personnel involved in your testing process.
                  </p>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Information Sharing</h2>
              </div>
              <div className="space-y-3 text-gray-700 text-sm sm:text-base">
                <p>We do not sell, trade, or rent your personal information. We may share information only in these circumstances:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations or court orders</li>
                  <li>With trusted service providers who assist in our operations</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>In connection with a business transfer or merger</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Rights</h2>
              </div>
              <div className="space-y-3 text-gray-700 text-sm sm:text-base">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Access and review your personal information</li>
                  <li>Request corrections to inaccurate data</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request data portability</li>
                  <li>File a complaint with regulatory authorities</li>
                </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  <span className="text-gray-700 text-sm sm:text-base">nsplabs03@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  <span className="text-gray-700 text-sm sm:text-base">+91 9740579955</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mt-0.5">📍</div>
                  <span className="text-gray-700 text-sm sm:text-base">
                    NSP Labs 2nd floor, 1-1-32/3, Vijaylaxmi Estates,<br />
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

export default PrivacyPolicy;