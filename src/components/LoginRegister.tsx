import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Fish, Mail, Lock, User, AlertCircle, Menu, X, TestTube, Droplets, Beaker, Zap } from 'lucide-react';

const LoginRegister: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let success = false;
      
      if (isLogin) {
        success = await login(formData.email, formData.password);
        if (!success) {
          setError('Invalid email or password. Try john@example.com with any password.');
        }
      } else {
        if (!formData.name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        success = await register(formData.email, formData.password, formData.name);
        if (!success) {
          setError('Email already exists');
        }
      }

      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const services = [
    {
      icon: TestTube,
      title: 'Antibiotics Testing',
      description: 'Detect residues in shrimp samples with precision testing methods'
    },
    {
      icon: Beaker,
      title: 'Dye Testing',
      description: 'Identify illegal/harmful dye content using advanced analysis'
    },
    {
      icon: Droplets,
      title: 'Water Testing',
      description: 'Test for water quality & safety parameters in aquaculture'
    },
    {
      icon: Zap,
      title: 'Sodium Testing',
      description: 'Verify sodium levels in line with industry standards'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg">
                <Fish className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NSP Labs</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Shrimp Testing Solutions</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-cyan-600 font-medium transition-colors">Home</a>
              <a href="#services" className="text-gray-700 hover:text-cyan-600 font-medium transition-colors">Services</a>
              <a href="#about" className="text-gray-700 hover:text-cyan-600 font-medium transition-colors">About Us</a>
              <a href="#resources" className="text-gray-700 hover:text-cyan-600 font-medium transition-colors">Resources</a>
              <a href="#contact" className="text-gray-700 hover:text-cyan-600 font-medium transition-colors">Contact</a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-3">
                <a href="#home" className="text-gray-700 hover:text-cyan-600 font-medium px-2 py-1">Home</a>
                <a href="#services" className="text-gray-700 hover:text-cyan-600 font-medium px-2 py-1">Services</a>
                <a href="#about" className="text-gray-700 hover:text-cyan-600 font-medium px-2 py-1">About Us</a>
                <a href="#resources" className="text-gray-700 hover:text-cyan-600 font-medium px-2 py-1">Resources</a>
                <a href="#contact" className="text-gray-700 hover:text-cyan-600 font-medium px-2 py-1">Contact</a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/10 to-teal-400/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Partner in{' '}
                <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Shrimp Quality
                </span>{' '}
                & Water Testing
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Reliable testing for antibiotics, dyes, water, and sodium – certified by experts with cutting-edge laboratory technology.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Learn More
                </button>
                <button className="border-2 border-cyan-500 text-cyan-600 px-8 py-4 rounded-lg font-semibold hover:bg-cyan-50 transition-all duration-200">
                  Request a Test
                </button>
              </div>
            </div>

            {/* Right Login Panel */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-blue-200 rounded-xl shadow-2xl p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-3">
                    <Fish className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Welcome Back</h3>
                  <p className="text-gray-600 text-sm">Access your testing dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  )}

                  {!isLogin && (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Full name"
                        required={!isLogin}
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Email address"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                      setFormData({ email: '', password: '', name: '' });
                    }}
                    className="w-full text-cyan-600 hover:text-cyan-500 font-medium"
                  >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Testing Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive laboratory testing solutions for the aquaculture industry with certified accuracy and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-blue-100"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg">
                  <Fish className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">NSP Labs</h3>
                  <p className="text-gray-400 text-sm">Shrimp Testing Solutions</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Registered Testing Facility providing comprehensive aquaculture testing services with certified accuracy and industry-leading expertise.
              </p>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">📍 123 Marine Drive, Coastal City, CC 12345</p>
                <p className="text-gray-400 text-sm">☎ +1 (555) 123-4567</p>
                <p className="text-gray-400 text-sm">📧 info@nsplabs.com</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#services" className="text-gray-400 hover:text-cyan-400 transition-colors">Services</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-cyan-400 transition-colors">About Us</a></li>
                <li><a href="#resources" className="text-gray-400 hover:text-cyan-400 transition-colors">Resources</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-cyan-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal & Social */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal & Social</h4>
              <ul className="space-y-2 mb-4">
                <li><a href="#privacy" className="text-gray-400 hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="text-gray-400 hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                <li><a href="#blog" className="text-gray-400 hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="#careers" className="text-gray-400 hover:text-cyan-400 transition-colors">Careers</a></li>
              </ul>
              <div className="flex space-x-3">
                <a href="#linkedin" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors">
                  <span className="text-xs">in</span>
                </a>
                <a href="#twitter" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors">
                  <span className="text-xs">tw</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 NSP Labs - Shrimp Testing Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginRegister;