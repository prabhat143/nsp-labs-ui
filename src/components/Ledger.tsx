import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { apiService } from '../services/api';
import { SampleSubmission } from '../types';
import {
  Mail,
  Download,
  Filter,
  Search,
  Calendar,
  CheckSquare,
  Square,
  Send,
  FileText,
  Users,
  Phone,
  MapPin,
  Clock,
  RefreshCw,
  FileCheck,
  Eye,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface LedgerFilters {
  status: string;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
}

const Ledger: React.FC = () => {
  const { user } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(false);
  const [samples, setSamples] = useState<SampleSubmission[]>([]);
  const [selectedSamples, setSelectedSamples] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<LedgerFilters>({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('Sample Test Report Update');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [includeReports, setIncludeReports] = useState(false);
  const [expandedAddresses, setExpandedAddresses] = useState<Set<string>>(new Set());
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check for mobile view and prevent horizontal scroll
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 640);
      
      // Prevent horizontal scrolling on very small devices
      if (window.innerWidth < 450) {
        document.body.style.overflowX = 'hidden';
      } else {
        document.body.style.overflowX = 'auto';
      }
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => {
      window.removeEventListener('resize', checkMobileView);
      document.body.style.overflowX = 'auto'; // Reset on unmount
    };
  }, []);

  // Function to truncate text and handle expansion
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const toggleAddressExpansion = (sampleId: string) => {
    const newExpanded = new Set(expandedAddresses);
    if (newExpanded.has(sampleId)) {
      newExpanded.delete(sampleId);
    } else {
      newExpanded.add(sampleId);
    }
    setExpandedAddresses(newExpanded);
  };

  // Load samples on component mount
  useEffect(() => {
    loadSamples();
  }, [user?.id]);

  const loadSamples = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await apiService.getSampleSubmissions(user.id);
      setSamples(response);
    } catch (error) {
      console.error('Error loading samples:', error);
      showToast('Failed to load samples', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter samples based on current filters
  const filteredSamples = samples.filter(sample => {
    const matchesStatus = filters.status === 'all' || sample.status.toLowerCase() === filters.status.toLowerCase();
    const searchTerm = filters.searchTerm.toLowerCase();
    const matchesSearch = !filters.searchTerm || 
      sample.samplerName.toLowerCase().includes(searchTerm) ||
      sample.shrimpCategory.toLowerCase().includes(searchTerm) ||
      sample.shrimpSubCategory?.toLowerCase().includes(searchTerm) ||
      sample.id.toString().includes(searchTerm) ||
      sample.phoneNumber?.toLowerCase().includes(searchTerm) ||
      sample.emailAddress?.toLowerCase().includes(searchTerm) ||
      sample.samplerLocation?.toLowerCase().includes(searchTerm);
    
    const sampleDate = new Date(sample.createdAt);
    const matchesDateFrom = !filters.dateFrom || sampleDate >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || sampleDate <= new Date(filters.dateTo);

    return matchesStatus && matchesSearch && matchesDateFrom && matchesDateTo;
  });

  // Pagination calculations
  const totalItems = filteredSamples.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageSamples = filteredSamples.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.searchTerm, filters.status, filters.dateFrom, filters.dateTo]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedSamples(new Set()); // Clear selection when changing pages
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setSelectedSamples(new Set());
  };

  // Handle individual checkbox toggle
  const handleSampleToggle = (sampleId: string) => {
    const newSelected = new Set(selectedSamples);
    if (newSelected.has(sampleId)) {
      newSelected.delete(sampleId);
    } else {
      newSelected.add(sampleId);
    }
    setSelectedSamples(newSelected);
  };

  // Handle select all/none for current page
  const handleSelectAll = () => {
    const currentPageIds = currentPageSamples.map(s => s.id);
    const newSelected = new Set(selectedSamples);
    
    const allCurrentPageSelected = currentPageIds.every(id => selectedSamples.has(id));
    
    if (allCurrentPageSelected) {
      // Deselect all from current page
      currentPageIds.forEach(id => newSelected.delete(id));
    } else {
      // Select all from current page
      currentPageIds.forEach(id => newSelected.add(id));
    }
    
    setSelectedSamples(newSelected);
  };

  // Get selected samples data
  const getSelectedSamplesData = () => {
    return samples.filter(sample => selectedSamples.has(sample.id));
  };

  // Handle send email
  const handleSendEmail = async () => {
    if (selectedSamples.size === 0) {
      showToast('Please select at least one sample', 'error');
      return;
    }

    try {
      setSendingEmail(true);
      const selectedSamplesData = getSelectedSamplesData();
      
      // Extract unique recipients from selected samples
      const recipients = Array.from(new Set(
        selectedSamplesData.map(sample => sample.emailAddress).filter(Boolean)
      ));

      if (recipients.length === 0) {
        showToast('No email addresses found for selected samples', 'error');
        return;
      }

      // Check if any selected samples are completed and should include reports
      const completedSamples = selectedSamplesData.filter(sample => sample.status === 'COMPLETED');
      const hasCompletedSamples = completedSamples.length > 0;

      // For now, we'll simulate sending emails since we need to implement the API endpoint
      // TODO: Implement actual email sending API
      console.log('Sending emails to:', recipients);
      console.log('Subject:', emailSubject);
      console.log('Message:', emailMessage);
      console.log('Sample IDs:', Array.from(selectedSamples));
      
      if (hasCompletedSamples && includeReports) {
        console.log('Including reports for completed samples:', completedSamples.map(s => s.id));
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const reportMessage = hasCompletedSamples && includeReports 
        ? ` (with ${completedSamples.length} reports attached)`
        : '';
      
      showToast(`Email sent successfully to ${recipients.length} recipients${reportMessage}`, 'success');
      setShowEmailModal(false);
      setSelectedSamples(new Set());
      setEmailMessage('');
    } catch (error) {
      console.error('Error sending emails:', error);
      showToast('Failed to send emails', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  // Handle view report
  const handleViewReport = (sampleId: string) => {
    // TODO: Implement report viewing functionality
    console.log('Viewing report for sample:', sampleId);
    showToast('Report viewing feature coming soon', 'warning');
  };

  // Check if sample has completed status
  const isCompleted = (status: string) => status === 'COMPLETED';

  // Export selected samples
  const handleExportSelected = () => {
    if (selectedSamples.size === 0) {
      showToast('Please select at least one sample', 'error');
      return;
    }

    const selectedData = getSelectedSamplesData();
    const csvContent = convertToCSV(selectedData);
    downloadCSV(csvContent, 'selected_samples.csv');
    showToast('Export completed successfully', 'success');
  };

  // Convert samples to CSV
  const convertToCSV = (data: SampleSubmission[]) => {
    const headers = ['Sample ID', 'Shrimp Category', 'Sampler', 'Status', 'Date Submitted', 'Location'];
    const rows = data.map(sample => [
      sample.id,
      sample.shrimpCategory,
      sample.samplerName,
      sample.status,
      new Date(sample.createdAt).toLocaleDateString(),
      sample.samplerLocation || 'N/A'
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  };

  // Download CSV file
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'PENDING': 'bg-blue-100 text-blue-800',
      'PROCESSING': 'bg-yellow-100 text-yellow-800',
      'TESTING': 'bg-orange-100 text-orange-800',
      'COMPLETED': 'bg-green-100 text-green-800'
    };
    
    return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 space-y-3 sm:space-y-4 lg:space-y-6 overflow-hidden">
      {/* Header */}
      <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white truncate">Sample Ledger</h1>
                <p className="text-emerald-100 text-xs sm:text-sm lg:text-base truncate">
                  Manage your testing network
                </p>
              </div>
            </div>
            <div className="flex gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0 w-full sm:w-auto justify-stretch sm:justify-end">
              <button
                onClick={() => setShowEmailModal(true)}
                disabled={selectedSamples.size === 0}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2 py-2 sm:px-3 sm:py-2 lg:px-4 lg:py-2 rounded-md sm:rounded-lg transition-colors flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm lg:text-base min-h-[36px] sm:min-h-[40px] flex-1 sm:flex-none"
              >
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden min-[380px]:inline sm:hidden md:inline truncate">Email</span>
                <span className="min-[380px]:hidden sm:inline md:hidden">📧</span>
                <span className="text-xs">({selectedSamples.size})</span>
              </button>
              <button
                onClick={handleExportSelected}
                disabled={selectedSamples.size === 0}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2 py-2 sm:px-3 sm:py-2 lg:px-4 lg:py-2 rounded-md sm:rounded-lg transition-colors flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm lg:text-base min-h-[36px] sm:min-h-[40px] flex-1 sm:flex-none"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden min-[380px]:inline truncate">Export</span>
                <span className="min-[380px]:hidden">📥</span>
              </button>
              <button
                onClick={loadSamples}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2 py-2 sm:px-3 sm:py-2 lg:px-4 lg:py-2 rounded-md sm:rounded-lg transition-colors flex items-center justify-center space-x-1 text-xs sm:text-sm lg:text-base min-h-[36px] sm:min-h-[40px] flex-1 sm:flex-none"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200">
          {/* Desktop Filters - Always Visible */}
          <div className="hidden lg:block p-4 lg:p-6">
            <div className="space-y-4">
              {/* Search - Full width */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by sample ID, sampler name, email, phone, or location..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 text-base placeholder-gray-400 transition-all duration-200 focus:shadow-lg bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-3 gap-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 appearance-none bg-white text-sm transition-all duration-200 focus:shadow-md"
                    >
                      <option value="all">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="TESTING">Testing</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Date From */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">From Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 text-sm transition-all duration-200 focus:shadow-md bg-white"
                    />
                  </div>
                </div>

                {/* Date To */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">To Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 text-sm transition-all duration-200 focus:shadow-md bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Filters - Collapsible */}
          <div className="lg:hidden">
            {/* Always visible search */}
            <div className="p-2 sm:p-3">
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search samples..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 text-sm placeholder-gray-400 transition-all duration-200 focus:shadow-lg bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Collapsible Filter Toggle */}
            <div className="px-2 sm:px-3 pb-2">
              <button
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                className="flex items-center justify-between w-full py-2 px-2 sm:px-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 min-h-[40px]"
              >
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filters</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${isFiltersExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Expandable Filter Content */}
            {isFiltersExpanded && (
              <div className="px-2 sm:px-3 pb-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 gap-3">
                  {/* Status Filter */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</label>
                    <div className="relative">
                      <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 appearance-none bg-white text-sm transition-all duration-200 focus:shadow-md"
                      >
                        <option value="all">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="TESTING">Testing</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date Filters in a row for very small screens */}
                  <div className="grid grid-cols-2 gap-2 min-[480px]:gap-3">
                    {/* Date From */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">From</label>
                      <div className="relative">
                        <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                        <input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                          className="w-full pl-8 pr-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 text-xs transition-all duration-200 focus:shadow-md bg-white"
                        />
                      </div>
                    </div>

                    {/* Date To */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">To</label>
                      <div className="relative">
                        <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                        <input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                          className="w-full pl-8 pr-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 text-xs transition-all duration-200 focus:shadow-md bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 bg-gray-50 border-b border-gray-200 overflow-x-hidden">
          <div className="flex flex-col gap-2 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between w-full">
            <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600">
              <span className="font-medium truncate">Total: {filteredSamples.length}</span>
              <span className="font-medium truncate">Selected: {selectedSamples.size}</span>
              <span className="text-gray-500 text-xs truncate">
                {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
              </span>
            </div>

            <div className="flex flex-col gap-2 min-[480px]:flex-row min-[480px]:items-center min-[480px]:gap-x-2 sm:gap-x-3">
              {/* Items per page selector */}
              <div className="flex items-center justify-start gap-x-1 sm:gap-x-2 text-xs">
                <span className="text-gray-600 flex-shrink-0">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded px-1 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-w-[40px] max-w-[60px]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-gray-600 flex-shrink-0 hidden min-[380px]:inline">per page</span>
              </div>

              {/* Select All button */}
              <button
                onClick={handleSelectAll}
                className="flex items-center justify-start gap-x-1 sm:gap-x-2 text-xs text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg transition-colors duration-200 min-h-[28px] sm:min-h-[32px]"
              >
                {selectedSamples.size === currentPageSamples.length && currentPageSamples.length > 0 ? (
                  <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                ) : (
                  <Square className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                )}
                <span className="font-medium text-xs truncate">
                  {selectedSamples.size === currentPageSamples.length && currentPageSamples.length > 0 ? 'Deselect' : 'Select'} Page
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Table/Cards */}
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-gray-600">Loading samples...</span>
            </div>
          ) : filteredSamples.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No samples found matching your criteria</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleSelectAll}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {selectedSamples.size === currentPageSamples.length && currentPageSamples.length > 0 &&
                             currentPageSamples.every(s => selectedSamples.has(s.id)) ? (
                              <CheckSquare className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          <span>Select</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sample Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sampler Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentPageSamples.map((sample) => (
                      <tr key={sample.id} className={`hover:bg-gray-50 ${selectedSamples.has(sample.id) ? 'bg-emerald-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleSampleToggle(sample.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {selectedSamples.has(sample.id) ? (
                              <CheckSquare className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">Sample #{sample.id}</div>
                            <div className="text-sm text-gray-500">{sample.shrimpCategory}</div>
                            {sample.shrimpSubCategory && (
                              <div className="text-xs text-gray-400">{sample.shrimpSubCategory}</div>
                            )}
                            {sample.samplerLocation && (
                              <div className="flex items-start text-xs text-gray-400 mt-1 max-w-xs">
                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                  {expandedAddresses.has(`desktop-${sample.id}`) ? (
                                    <div>
                                      <span>{sample.samplerLocation}</span>
                                      <button
                                        onClick={() => toggleAddressExpansion(`desktop-${sample.id}`)}
                                        className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
                                      >
                                        less
                                      </button>
                                    </div>
                                  ) : (
                                    <div>
                                      <span className="break-words">
                                        {truncateText(sample.samplerLocation, 60)}
                                      </span>
                                      {sample.samplerLocation.length > 60 && (
                                        <button
                                          onClick={() => toggleAddressExpansion(`desktop-${sample.id}`)}
                                          className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                          more
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center text-sm text-gray-900">
                              <Users className="h-4 w-4 mr-2 text-gray-400" />
                              {sample.samplerName}
                            </div>
                            {sample.phoneNumber && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Phone className="h-3 w-3 mr-1" />
                                {sample.phoneNumber}
                              </div>
                            )}
                            {sample.emailAddress && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Mail className="h-3 w-3 mr-1" />
                                {sample.emailAddress}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(sample.status)}`}>
                              {sample.status}
                            </span>
                            {isCompleted(sample.status) && (
                              <div className="flex items-center space-x-1" title="Report Available">
                                <FileCheck className="h-4 w-4 text-green-600" />
                                <span className="text-xs text-green-600">Report Ready</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-2" />
                            {new Date(sample.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSampleToggle(sample.id)}
                              className="text-emerald-600 hover:text-emerald-900"
                            >
                              {selectedSamples.has(sample.id) ? 'Deselect' : 'Select'}
                            </button>
                            {isCompleted(sample.status) && (
                              <>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => handleViewReport(sample.id)}
                                  className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>View Report</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Visible only on mobile and tablet */}
              <div className="lg:hidden">
                <div className="space-y-2 sm:space-y-3 p-2 sm:p-3">
                  {currentPageSamples.map((sample) => (
                    <div
                      key={sample.id}
                      className={`bg-white rounded-lg border p-3 transition-all duration-200 ${
                        selectedSamples.has(sample.id) 
                          ? 'border-emerald-300 bg-emerald-50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start space-x-2 flex-1 min-w-0">
                          <button
                            onClick={() => handleSampleToggle(sample.id)}
                            className="p-1 hover:bg-gray-200 rounded mt-0.5 flex-shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            {selectedSamples.has(sample.id) ? (
                              <CheckSquare className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              Sample #{sample.id}
                            </div>
                            <div className="text-xs text-gray-600 truncate">{sample.shrimpCategory}</div>
                            {sample.shrimpSubCategory && (
                              <div className="text-xs text-gray-500 truncate">{sample.shrimpSubCategory}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-1">
                          <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(sample.status)}`}>
                            {sample.status}
                          </span>
                          {isCompleted(sample.status) && (
                            <div className="flex items-center space-x-1" title="Report Available">
                              <FileCheck className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">Report</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sampler Info */}
                      <div className="border-t border-gray-100 pt-2 mb-2">
                        <div className="flex items-center text-sm text-gray-900 mb-1">
                          <Users className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                          <span className="font-medium truncate text-xs">{sample.samplerName}</span>
                        </div>
                        <div className="space-y-1 text-xs text-gray-500">
                          {sample.phoneNumber && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{sample.phoneNumber}</span>
                            </div>
                          )}
                          {sample.emailAddress && (
                            <div className="flex items-start">
                              <Mail className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0 mt-0.5" />
                              <span className="break-all text-xs">{sample.emailAddress}</span>
                            </div>
                          )}
                          {sample.samplerLocation && (
                            <div className="flex items-start">
                              <MapPin className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                {expandedAddresses.has(sample.id) ? (
                                  <div>
                                    <span className="text-gray-600 text-xs break-words">
                                      {sample.samplerLocation}
                                    </span>
                                    <button
                                      onClick={() => toggleAddressExpansion(sample.id)}
                                      className="ml-1 text-blue-600 hover:text-blue-800 font-medium text-xs underline"
                                    >
                                      less
                                    </button>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-gray-600 text-xs break-words">
                                      {truncateText(sample.samplerLocation, 30)}
                                    </span>
                                    {sample.samplerLocation.length > 30 && (
                                      <button
                                        onClick={() => toggleAddressExpansion(sample.id)}
                                        className="ml-1 text-blue-600 hover:text-blue-800 font-medium text-xs underline"
                                      >
                                        more
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Date and Actions */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="text-xs">{new Date(sample.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleSampleToggle(sample.id)}
                            className="text-xs text-emerald-600 hover:text-emerald-900 font-medium bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors min-h-[28px]"
                          >
                            {selectedSamples.has(sample.id) ? 'Deselect' : 'Select'}
                          </button>
                          {isCompleted(sample.status) && (
                            <button
                              onClick={() => handleViewReport(sample.id)}
                              className="text-xs text-blue-600 hover:text-blue-900 flex items-center space-x-1 font-medium bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors min-h-[28px]"
                            >
                              <Eye className="h-3 w-3 flex-shrink-0" />
                              <span>View</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {filteredSamples.length > 0 && totalPages > 1 && (
          <div className="px-2 sm:px-3 lg:px-6 py-3 border-t border-gray-200 bg-white">
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              {/* Pagination Info */}
              <div className="text-xs text-gray-700 text-center sm:text-left">
                <span className="font-medium">{startIndex + 1}</span>-<span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
                <span className="font-medium">{totalItems}</span>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-center space-x-0.5 sm:space-x-1 overflow-x-auto">
                {/* First Page Button (only show if not on first few pages) */}
                {currentPage > 3 && totalPages > 5 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-xs font-medium rounded-lg bg-white text-gray-500 border border-gray-300 hover:bg-gray-50 transition-colors flex-shrink-0"
                    >
                      1
                    </button>
                    <span className="text-gray-400 text-xs px-0.5">...</span>
                  </>
                )}

                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-1.5 sm:px-2 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden min-[380px]:inline sm:hidden lg:inline ml-0.5">Prev</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-0.5 overflow-x-auto">
                  {Array.from({ length: Math.min(totalPages, isMobileView ? 3 : 5) }, (_, i) => {
                    let pageNum;
                    const maxPages = isMobileView ? 3 : 5;
                    
                    if (totalPages <= maxPages) {
                      pageNum = i + 1;
                    } else if (currentPage <= Math.ceil(maxPages / 2)) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - Math.floor(maxPages / 2)) {
                      pageNum = totalPages - maxPages + 1 + i;
                    } else {
                      pageNum = currentPage - Math.floor(maxPages / 2) + i;
                    }

                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-xs font-medium rounded-lg transition-colors flex-shrink-0 ${
                          currentPage === pageNum
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-1.5 sm:px-2 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  <span className="hidden min-[380px]:inline sm:hidden lg:inline mr-0.5">Next</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>

                {/* Last Page Button (only show if not on last few pages) */}
                {currentPage < totalPages - 2 && totalPages > 5 && (
                  <>
                    <span className="text-gray-400 text-xs px-0.5">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-xs font-medium rounded-lg bg-white text-gray-500 border border-gray-300 hover:bg-gray-50 transition-colors flex-shrink-0"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-3">
          <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg md:max-w-xl max-h-[95vh] sm:max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl sm:rounded-t-xl">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 pr-2">Send Email</h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                {/* Recipients Info */}
                <div className="bg-emerald-50 rounded-lg p-2 sm:p-3">
                  <h3 className="text-xs sm:text-sm font-medium text-emerald-800 mb-1">Recipients</h3>
                  <div className="text-xs text-emerald-700 max-h-24 overflow-y-auto">
                    {Array.from(new Set(getSelectedSamplesData().map(s => s.emailAddress).filter(Boolean))).map((email, index) => (
                      <div key={index} className="flex items-center py-0.5">
                        <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="break-all text-xs">{email}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Completed Samples Info */}
                  {getSelectedSamplesData().some(s => isCompleted(s.status)) && (
                    <div className="mt-2 pt-2 border-t border-emerald-200">
                      <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-1">
                          <FileCheck className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                          <span className="text-xs text-emerald-800">
                            {getSelectedSamplesData().filter(s => isCompleted(s.status)).length} completed with reports
                          </span>
                        </div>
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeReports}
                            onChange={(e) => setIncludeReports(e.target.checked)}
                            className="w-3 h-3 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                          />
                          <span className="text-xs text-emerald-700 font-medium">Include Reports</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    placeholder="Enter email subject"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows={3}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                    placeholder="Enter your message..."
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-end sm:space-x-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium min-h-[36px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail || !emailMessage.trim()}
                    className="w-full sm:w-auto px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-h-[36px]"
                  >
                    <Send className="h-3 w-3 flex-shrink-0" />
                    <span>{sendingEmail ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Ledger;
