import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { Mail, Lock, User, AlertCircle, Menu, X, TestTube, Droplets, Beaker, Zap, Award, Shield, Clock, Users } from 'lucide-react';

const LoginRegister: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register, error: authError } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(formData.email, formData.password);
        if (success) {
          navigate('/dashboard');
        } else {
          // Use the error from AuthContext if available, otherwise provide fallback
          setError(authError || 'Login failed. Please check your credentials and try again.');
        }
      } else {
        if (!formData.fullName.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        
        const result = await register(formData.email, formData.password, formData.fullName);
        
        if (result.success) {
          // Show success message and switch to login mode
          setIsLogin(true);
          setFormData({ email: formData.email, password: '', fullName: '' });
          setError(''); // Clear any previous errors
          
          // Show success toast
          showToast(result.message || 'Registration successful! Please login with your credentials.', 'success');
        } else {
          setError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred. Please try again.');
      }
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

  const aboutFeatures = [
    {
      icon: Award,
      title: 'Certified Excellence',
      description: 'ISO 17025 accredited laboratory with international quality standards'
    },
    {
      icon: Shield,
      title: 'Trusted Results',
      description: 'Over 15 years of experience in aquaculture testing and analysis'
    },
    {
      icon: Clock,
      title: 'Fast Turnaround',
      description: 'Quick and reliable testing with results delivered within 24-48 hours'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Highly qualified marine biologists and analytical chemists'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
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

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-cyan-600 font-medium transition-colors">Home</a>
              <a href="#services" className="text-gray-700 hover:text-cyan-600 font-medium transition-colors">Services</a>
              <a href="#about" className="text-gray-700 hover:text-cyan-600 font-medium transition-colors">About Us</a>
              <a href="/blog" className="text-gray-700 hover:text-cyan-600 font-medium transition-colors">Blog</a>
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
                <a href="/blog" className="text-gray-700 hover:text-cyan-600 font-medium px-2 py-1">Blog</a>
                <a href="#contact" className="text-gray-700 hover:text-cyan-600 font-medium px-2 py-1">Contact</a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Full Screen */}
      <section id="home" className="relative min-h-screen flex items-center py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/10 to-teal-400/10"></div>
        
        <div className="relative w-full h-full flex items-center">
          <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
              
              {/* Left Content Section - Normal Text Sizes */}
              <div className="flex flex-col justify-center space-y-8 lg:pr-8">
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                    Your Partner in{' '}
                    <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      Shrimp Quality
                    </span>{' '}
                    & Water Testing
                  </h1>
                  
                  <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Reliable testing for antibiotics, dyes, water, and sodium – certified by experts with cutting-edge laboratory technology.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button 
                      onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Learn More
                    </button>
                    <button 
                      onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                      className="border-2 border-cyan-500 text-cyan-600 px-8 py-3 rounded-lg font-semibold hover:bg-cyan-50 transition-all duration-200 transform hover:-translate-y-1"
                    >
                      Request a Test
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Login Section - Expanded and Enhanced */}
              <div className="flex items-center justify-center lg:justify-end h-full">
                <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-blue-200 rounded-3xl shadow-2xl p-12 lg:p-16">
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-6">
                      <img 
                        src="/WhatsApp Image 2025-05-18 at 1.21.28 PM.jpeg" 
                        alt="NSP Labs Logo" 
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back</h3>
                    <p className="text-gray-600 text-lg">Access your testing dashboard</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                        <span className="text-sm text-red-700">{error}</span>
                      </div>
                    )}

                    {!isLogin && (
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pl-14 pr-6 py-5 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                          placeholder="Full name"
                          required={!isLogin}
                        />
                      </div>
                    )}

                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-14 pr-6 py-5 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                        placeholder="Email address"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-14 pr-6 py-5 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                        placeholder="Password"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-5 px-6 rounded-xl font-semibold text-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                    >
                      {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                        setFormData({ email: '', password: '', fullName: '' });
                      }}
                      className="w-full text-cyan-600 hover:text-cyan-500 font-medium text-lg py-3"
                    >
                      {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              About NSP Labs
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              NSP Analytical Labs Private Limited is a premier testing facility specializing in comprehensive aquaculture analysis. 
              We provide accurate, reliable solutions for the shrimp farming industry with state-of-the-art technology and expert knowledge.
            </p>
          </div>

          {/* Company Story */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                At NSP Labs, we are committed to ensuring the highest quality standards in aquaculture through precise analytical testing. 
                Our mission is to support sustainable shrimp farming practices by providing farmers, exporters, and processors with 
                reliable testing services that meet international standards.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We understand the critical importance of quality control in the aquaculture industry. Our comprehensive testing 
                solutions help identify potential issues early, ensuring product safety, compliance with regulations, and 
                maintaining the reputation of your brand in global markets.
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the leading analytical laboratory in the aquaculture sector, recognized for our technical excellence, 
                innovative solutions, and unwavering commitment to quality. We envision a future where every shrimp farm 
                has access to world-class testing services that promote sustainable and profitable operations.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Through continuous investment in technology, training, and research, we strive to stay at the forefront of 
                analytical science, providing our clients with the most advanced and accurate testing capabilities available.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {aboutFeatures.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-blue-100"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Expertise Section */}
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Expertise</h3>
              <p className="text-gray-600 max-w-3xl mx-auto">
                With over 15 years of experience in aquaculture testing, our team of marine biologists, analytical chemists, 
                and quality assurance specialists brings unparalleled expertise to every analysis.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600 mb-2">15+</div>
                <div className="text-gray-600">Years of Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600 mb-2">10,000+</div>
                <div className="text-gray-600">Samples Tested</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600 mb-2">500+</div>
                <div className="text-gray-600">Satisfied Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600 mb-2">24-48h</div>
                <div className="text-gray-600">Average Turnaround</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600 mb-2">ISO 17025</div>
                <div className="text-gray-600">Accredited</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600 mb-2">99.9%</div>
                <div className="text-gray-600">Accuracy Rate</div>
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

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get in touch with our expert team for all your aquaculture testing needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Get In Touch</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">nsplabs03@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                    <p className="text-gray-600">+91 9740579955</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-600 leading-relaxed">
                      NSP Labs 2nd floor, 1-1-32/3, Vijaylaxmi Estates,<br />
                      JP Road, Julupalem, Bhimavaram,<br />
                      West Godavari, Andhra Pradesh - 534202
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Your last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Tell us about your testing requirements..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Send Message
                </button>
              </form>
            </div>
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
                <img 
                  src="/WhatsApp Image 2025-05-18 at 1.21.28 PM.jpeg" 
                  alt="NSP Labs Logo" 
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold">NSP Labs</h3>
                  <p className="text-gray-400 text-sm">Analytical Labs Private Limited</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Registered Testing Facility providing comprehensive aquaculture testing services with certified accuracy and industry-leading expertise.
              </p>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">📍 NSP Labs 2nd floor, 1-1-32/3, Vijaylaxmi Estates, JP Road, Julupalem, Bhimavaram, West Godavari, Andhra Pradesh - 534202</p>
                <p className="text-gray-400 text-sm">☎ +91 9740579955</p>
                <p className="text-gray-400 text-sm">📧 nsplabs03@gmail.com</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#services" className="text-gray-400 hover:text-cyan-400 transition-colors">Services</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-cyan-400 transition-colors">About Us</a></li>
                <li><a href="/blog" className="text-gray-400 hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-cyan-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal & Social */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal & Social</h4>
              <ul className="space-y-2 mb-4">
                <li><a href="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                <li><a href="/blog" className="text-gray-400 hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="/careers" className="text-gray-400 hover:text-cyan-400 transition-colors">Careers</a></li>
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
              © 2024 NSP Analytical Labs Private Limited. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
};

export default LoginRegister;