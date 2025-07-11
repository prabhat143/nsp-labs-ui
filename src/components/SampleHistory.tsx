import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSamples } from '../contexts/SamplesContext';
import { 
  FlaskConical, 
  Clock, 
  TestTube, 
  CheckCircle,
  Eye,
  Calendar,
  FileText,
  MapPin,
  Tag,
  User,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SampleHistory: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { samples, loading, error } = useSamples();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [highlightedSample, setHighlightedSample] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fileType, setFileType] = useState('csv');
  const [summaryType, setSummaryType] = useState('all'); // all, pending, collecting, collected, testing, completed
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pendingPdf, setPendingPdf] = useState<{
    filtered: any[];
    fromDate: string;
    toDate: string;
    summaryType: string;
  } | null>(null);

  useEffect(() => {
    const statusFilter = searchParams.get('status');
    const highlightParam = searchParams.get('highlight');
    
    if (statusFilter) {
      setActiveFilter(statusFilter);
    }
    
    if (highlightParam) {
      setHighlightedSample(highlightParam);
      // Remove highlight after 3 seconds
      setTimeout(() => setHighlightedSample(null), 3000);
    }

    // Set default fromDate (earliest sample date) and toDate (today)
    if (samples.length > 0) {
      const sorted = [...samples].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setFromDate(sorted[0] ? new Date(sorted[0].createdAt).toISOString().slice(0, 10) : '');
      setToDate(new Date().toISOString().slice(0, 10));
    }
  }, [searchParams, samples]);

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'PROCESSING':
      case 'TESTING':
        return <TestTube className="h-5 w-5 text-purple-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PROCESSING':
      case 'TESTING':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Pending';
      case 'PROCESSING':
      case 'TESTING':
        return 'Testing';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleViewTimeline = (sampleId: string) => {
    navigate(`/timeline/${sampleId}`);
  };

  const handleDownloadSummary = () => {
    setShowSummaryModal(true);
  };

  const handleCloseModal = () => {
    setShowSummaryModal(false);
  };

  const handleGenerateSummary = () => {
    // Filter samples by date range
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    let filtered = samples.filter(s => {
      const created = new Date(s.createdAt);
      return (!from || created >= from) && (!to || created <= to);
    });
    // Further filter by summaryType if not 'all'
    if (summaryType !== 'all') {
      filtered = filtered.filter(s => {
        switch (summaryType) {
          case 'pending': return s.status.toUpperCase() === 'PENDING';
          case 'collecting': return s.status.toUpperCase() === 'COLLECTING';
          case 'collected': return s.status.toUpperCase() === 'COLLECTED';
          case 'testing': return s.status.toUpperCase() === 'PROCESSING' || s.status.toUpperCase() === 'TESTING';
          case 'completed': return s.status.toUpperCase() === 'COMPLETED';
          default: return true;
        }
      });
    }
    if (fileType === 'csv') {
      // CSV header
      const csvRows = [
        ['Sample ID', 'Status', 'Sampler Name', 'Location', 'Category', 'Sub-category', 'Created At', 'Updated At']
      ];
      // CSV data
      filtered.forEach(s => {
        csvRows.push([
          s.id,
          s.status,
          s.samplerName,
          s.samplerLocation,
          s.shrimpCategory,
          s.shrimpSubCategory,
          new Date(s.createdAt).toLocaleString(),
          new Date(s.updatedAt).toLocaleString()
        ]);
      });
      const csvContent = csvRows.map(e => e.map(x => `"${(x ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
      const fileName = `SampleSummary-${summaryType.charAt(0).toUpperCase() + summaryType.slice(1)}-${fromDate || 'NA'}-to-${toDate || 'NA'}.csv`;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } else if (fileType === 'pdf') {
      setPendingPdf({ filtered, fromDate, toDate, summaryType });
      setShowSummaryModal(false);
    }
  };

  // Generate PDF after modal closes
  useEffect(() => {
    if (pendingPdf) {
      const { filtered, fromDate, toDate, summaryType } = pendingPdf;
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
      doc.setFontSize(20);
      doc.setTextColor('#2563eb'); // blue-600
      doc.text('Sample Summary Report', 40, 50);
      doc.setFontSize(12);
      doc.setTextColor('#222');
      doc.text(`Summary Type: ${summaryType.charAt(0).toUpperCase() + summaryType.slice(1)}`, 40, 75);
      doc.text(`Date Range: ${fromDate || 'NA'} to ${toDate || 'NA'}`, 40, 95);
      autoTable(doc, {
        startY: 120,
        head: [[
          'Sample ID', 'Status', 'Sampler Name', 'Location', 'Category', 'Sub-category', 'Created At', 'Updated At'
        ]],
        body: filtered.map(s => [
          s.id,
          s.status,
          s.samplerName,
          s.samplerLocation,
          s.shrimpCategory,
          s.shrimpSubCategory,
          new Date(s.createdAt).toLocaleString(),
          new Date(s.updatedAt).toLocaleString()
        ]),
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' }, // blue-600
        bodyStyles: { fillColor: [240, 249, 255], textColor: [30, 41, 59] }, // blue-50, slate-800
        alternateRowStyles: { fillColor: [224, 231, 255] }, // blue-100
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
        margin: { left: 40, right: 40 },
        tableLineColor: [37, 99, 235],
        tableLineWidth: 0.5,
        didParseCell: function (data) {
          if (data.section === 'body' && data.column.index === 1) {
            const raw = data.cell.raw;
            if (typeof raw === 'string') {
              const status = raw.toUpperCase();
              if (status === 'PENDING') data.cell.styles.fillColor = [253, 224, 71]; // yellow-300
              else if (status === 'COLLECTING') data.cell.styles.fillColor = [244, 114, 182]; // pink-400
              else if (status === 'COLLECTED') data.cell.styles.fillColor = [251, 113, 133]; // rose-400
              else if (status === 'PROCESSING' || status === 'TESTING') data.cell.styles.fillColor = [96, 165, 250]; // blue-400
              else if (status === 'COMPLETED') data.cell.styles.fillColor = [34, 197, 94]; // green-500
            }
          }
        }
      });
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfBlob(blob);
      setPdfPreviewUrl(url);
      setPendingPdf(null);
    }
  }, [pendingPdf]);

  const handleClosePdfPreview = () => {
    setPdfPreviewUrl(null);
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
  };

  const handleDownloadPdf = () => {
    if (pdfBlob) {
      const fileName = `SampleSummary-${summaryType.charAt(0).toUpperCase() + summaryType.slice(1)}-${fromDate || 'NA'}-to-${toDate || 'NA'}.pdf`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(pdfBlob);
      a.download = fileName;
      a.click();
    }
  };

  // Filter samples based on active filter
  const getFilteredSamples = () => {
    switch (activeFilter) {
      case 'pending':
        return samples.filter(s => s.status.toUpperCase() === 'PENDING');
      case 'collecting':
        return samples.filter(s => s.status.toUpperCase() === 'COLLECTING');
      case 'collected':
        return samples.filter(s => s.status.toUpperCase() === 'COLLECTED');
      case 'testing':
        return samples.filter(s => s.status.toUpperCase() === 'PROCESSING' || s.status.toUpperCase() === 'TESTING');
      case 'completed':
        return samples.filter(s => s.status.toUpperCase() === 'COMPLETED');
      default:
        return samples;
    }
  };

  const filteredSamples = getFilteredSamples();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 relative">
        {/* Download Summary Button - top right corner */}
        <button
          onClick={handleDownloadSummary}
          className="absolute top-6 right-6 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm shadow z-10"
        >
          <Download className="w-4 h-4" />
          <span>Download Summary</span>
        </button>
        {/* Modal for summary options */}
        {showSummaryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
              <button onClick={handleCloseModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              <h2 className="text-lg font-bold mb-4 text-gray-900">Download Sample Summary</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary Type</label>
                <select value={summaryType} onChange={e => setSummaryType(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="collecting">Collecting</option>
                  <option value="collected">Collected</option>
                  <option value="testing">Testing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                <select value={fileType} onChange={e => setFileType(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <button
                onClick={handleGenerateSummary}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold shadow"
              >
                <Download className="w-4 h-4" />
                <span>Generate</span>
              </button>
            </div>
          </div>
        )}
        {/* PDF Preview Modal */}
        {pdfPreviewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-4xl relative flex flex-col">
              <button onClick={handleClosePdfPreview} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              <h2 className="text-lg font-bold mb-4 text-gray-900">Preview Sample Summary PDF</h2>
              <div className="flex-1 overflow-auto border rounded-lg mb-4" style={{ minHeight: 400, maxHeight: 600 }}>
                <iframe src={pdfPreviewUrl} title="PDF Preview" className="w-full h-full min-h-[400px]" />
              </div>
              <button
                onClick={handleDownloadPdf}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold shadow"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4 mb-6">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <FlaskConical className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Sample History</h1>
            <p className="text-gray-600 text-sm lg:text-base">Track the status of all your submitted samples</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { 
              label: 'Total Samples', 
              value: samples.length, 
              color: 'bg-blue-100 text-blue-800',
              filterKey: 'all',
              clickable: true
            },
            { 
              label: 'Pending', 
              value: samples.filter(s => s.status.toUpperCase() === 'PENDING').length, 
              color: 'bg-yellow-100 text-yellow-800',
              filterKey: 'pending',
              clickable: samples.filter(s => s.status.toUpperCase() === 'PENDING').length > 0
            },
            { 
              label: 'Collecting',
              value: samples.filter(s => s.status.toUpperCase() === 'COLLECTING').length,
              color: 'bg-pink-100 text-pink-800',
              filterKey: 'collecting',
              clickable: samples.filter(s => s.status.toUpperCase() === 'COLLECTING').length > 0
            },
            { 
              label: 'Collected',
              value: samples.filter(s => s.status.toUpperCase() === 'COLLECTED').length,
              color: 'bg-rose-100 text-rose-800',
              filterKey: 'collected',
              clickable: samples.filter(s => s.status.toUpperCase() === 'COLLECTED').length > 0
            },
            { 
              label: 'Testing', 
              value: samples.filter(s => s.status.toUpperCase() === 'PROCESSING' || s.status.toUpperCase() === 'TESTING').length, 
              color: 'bg-purple-100 text-purple-800',
              filterKey: 'testing',
              clickable: samples.filter(s => s.status.toUpperCase() === 'PROCESSING' || s.status.toUpperCase() === 'TESTING').length > 0
            },
            { 
              label: 'Completed', 
              value: samples.filter(s => s.status.toUpperCase() === 'COMPLETED').length, 
              color: 'bg-green-100 text-green-800',
              filterKey: 'completed',
              clickable: samples.filter(s => s.status.toUpperCase() === 'COMPLETED').length > 0
            },
          ].map((stat, index) => (
            <div 
              key={index} 
              onClick={stat.clickable ? () => setActiveFilter(stat.filterKey) : undefined}
              className={`${stat.color} rounded-lg p-3 lg:p-4 text-center transition-all duration-200 ${
                stat.clickable 
                  ? 'cursor-pointer hover:scale-105 transform hover:shadow-md' 
                  : ''
              } ${
                activeFilter === stat.filterKey 
                  ? 'ring-2 ring-blue-500 ring-offset-2' 
                  : ''
              }`}
            >
              <div className="text-lg lg:text-2xl font-bold">{stat.value}</div>
              <div className="text-xs lg:text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-center">
            <FlaskConical className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Loading Sample History...</h3>
            <p className="text-gray-600 mb-6 text-sm lg:text-base">Please wait while we fetch your samples.</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-center">
            <FlaskConical className="h-12 w-12 lg:h-16 lg:w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Error Loading Samples</h3>
            <p className="text-red-600 mb-6 text-sm lg:text-base">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : samples.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-center">
            <FlaskConical className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">No Samples Yet</h3>
            <p className="text-gray-600 mb-6 text-sm lg:text-base">You haven't submitted any samples for testing.</p>
            <button
              onClick={() => navigate('/submit-sample')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors"
            >
              Submit Your First Sample
            </button>
          </div>
        ) : filteredSamples.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-center">
            <FlaskConical className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">No {activeFilter === 'all' ? '' : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Samples</h3>
            <p className="text-gray-600 mb-6 text-sm lg:text-base">
              {activeFilter === 'all' 
                ? 'No samples found.' 
                : `You don't have any ${activeFilter} samples at the moment.`}
            </p>
            <button
              onClick={() => setActiveFilter('all')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors"
            >
              View All Samples
            </button>
          </div>
        ) : (
          filteredSamples.map((sample) => (
            <div 
              key={sample.id} 
              className={`bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-all duration-300 ${
                highlightedSample === sample.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50 shadow-2xl' 
                  : ''
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(sample.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(sample.status)}`}>
                        {getStatusLabel(sample.status)}
                      </span>
                      {(sample.status.toUpperCase() === 'PROCESSING' || sample.status.toUpperCase() === 'TESTING') && sample.assigned && (
                        <div className="relative group">
                          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200 cursor-pointer hover:bg-blue-200 transition-colors flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>Agent Assigned</span>
                          </span>
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            <div className="font-medium">Agent ID: {sample.assigned}</div>
                            <div className="text-gray-300">Lab Technician</div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Sample ID</h3>
                      <p className="text-gray-600 font-mono text-sm break-all">{sample.id}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Location
                      </h3>
                      <p className="text-gray-600 text-sm">{sample.samplerLocation}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        Category
                      </h3>
                      <p className="text-gray-600 text-sm">{sample.shrimpCategory}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Sub-category</h3>
                    <p className="text-gray-600 text-sm">{sample.shrimpSubCategory}</p>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    Submitted on {new Date(sample.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>

                  {/* View Details Section */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium text-sm">
                      View Details
                    </summary>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Sampler Name:</span>
                          <span className="ml-2 text-gray-600">{sample.samplerName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Status:</span>
                          <span className="ml-2 text-gray-600">{getStatusLabel(sample.status)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Created At:</span>
                          <span className="ml-2 text-gray-600">{new Date(sample.createdAt).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Updated At:</span>
                          <span className="ml-2 text-gray-600">{new Date(sample.updatedAt).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Location:</span>
                          <span className="ml-2 text-gray-600">{sample.samplerLocation}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Category:</span>
                          <span className="ml-2 text-gray-600">{sample.shrimpCategory}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Sub-category:</span>
                          <span className="ml-2 text-gray-600">{sample.shrimpSubCategory}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Agent Assigned:</span>
                          <span className="ml-2 text-gray-600">
                            {sample.assigned ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                <div className="flex flex-col space-y-2 lg:ml-4">
                  {(sample.status.toUpperCase() === 'PROCESSING' || sample.status.toUpperCase() === 'TESTING' || sample.status.toUpperCase() === 'COMPLETED') && (
                    <button
                      onClick={() => handleViewTimeline(sample.id)}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Timeline</span>
                    </button>
                  )}
                  
                  {sample.status.toUpperCase() === 'COMPLETED' && (
                    <button
                      onClick={() => navigate('/reports')}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View Report</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SampleHistory;