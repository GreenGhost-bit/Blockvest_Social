'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../components/ui/wallet-provider';

interface Document {
  id: string;
  type: 'identity' | 'address' | 'income' | 'bank' | 'other';
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  uploadedAt: string;
  reviewedAt?: string;
  reviewer?: string;
  notes?: string;
  fileUrl: string;
}

const VerificationPage: React.FC = () => {
  const { isConnected } = useWallet();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    type: 'identity' as Document['type'],
    name: ''
  });

  useEffect(() => {
    if (isConnected) {
      fetchDocuments();
    }
  }, [isConnected]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cacheKey = 'verification_documents';
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      const now = Date.now();
      
      // Use cached data if it's less than 10 minutes old
      if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 600000) {
        const cachedDocuments = JSON.parse(cachedData);
        setDocuments(cachedDocuments);
        setLoading(false);
        return;
      }
      
      // Mock documents - replace with actual API call
      const mockDocuments: Document[] = [
        {
          id: '1',
          type: 'identity',
          name: 'Driver License',
          status: 'approved',
          uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          reviewer: 'Verification Team',
          fileUrl: '/documents/driver-license.pdf'
        },
        {
          id: '2',
          type: 'address',
          name: 'Utility Bill',
          status: 'approved',
          uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          reviewer: 'Verification Team',
          fileUrl: '/documents/utility-bill.pdf'
        },
        {
          id: '3',
          type: 'income',
          name: 'Pay Stub',
          status: 'pending',
          uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          fileUrl: '/documents/pay-stub.pdf'
        },
        {
          id: '4',
          type: 'bank',
          name: 'Bank Statement',
          status: 'rejected',
          uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          reviewedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          reviewer: 'Verification Team',
          notes: 'Document is not clear enough. Please upload a higher resolution image.',
          fileUrl: '/documents/bank-statement.pdf'
        }
      ];
      
      // Validate and sanitize documents
      const validatedDocuments = mockDocuments.map(document => ({
        ...document,
        id: document.id.trim(),
        type: ['identity', 'address', 'income', 'bank', 'other'].includes(document.type) 
          ? document.type 
          : 'other' as Document['type'],
        name: document.name.trim(),
        status: ['pending', 'approved', 'rejected', 'expired'].includes(document.status) 
          ? document.status 
          : 'pending' as Document['status'],
        uploadedAt: document.uploadedAt,
        reviewedAt: document.reviewedAt,
        reviewer: document.reviewer?.trim(),
        notes: document.notes?.trim(),
        fileUrl: document.fileUrl.trim()
      }));
      
      setDocuments(validatedDocuments);
      
      // Cache the validated data
      localStorage.setItem(cacheKey, JSON.stringify(validatedDocuments));
      localStorage.setItem(`${cacheKey}_time`, now.toString());
      
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      // Set fallback data on error
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    
    if (!uploadData.name.trim()) {
      alert('Please enter a document name');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Please upload a valid file type (JPEG, PNG, or PDF)');
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      setLoading(true);
      // Mock file upload - replace with actual API call
      const newDocument: Document = {
        id: Date.now().toString(),
        type: uploadData.type,
        name: uploadData.name.trim(),
        status: 'pending',
        uploadedAt: new Date().toISOString(),
        fileUrl: URL.createObjectURL(selectedFile)
      };
      
      const updatedDocuments = [newDocument, ...documents];
      setDocuments(updatedDocuments);
      
      // Update cache
      localStorage.setItem('verification_documents', JSON.stringify(updatedDocuments));
      localStorage.setItem('verification_documents_time', Date.now().toString());
      
      setSelectedFile(null);
      setUploadData({ type: 'identity', name: '' });
      setShowUploadForm(false);
      
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'identity':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        );
      case 'address':
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'income':
        return (
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'bank':
        return (
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getVerificationProgress = () => {
    const approved = documents.filter(d => d.status === 'approved').length;
    const total = documents.length;
    const required = 3; // Minimum required documents
    return { approved, total, required, percentage: Math.min((approved / required) * 100, 100) };
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600">Please connect your wallet to manage document verification.</p>
        </div>
      </div>
    );
  }

  const { approved, total, required, percentage } = getVerificationProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Verification</h1>
              <p className="text-gray-600 mt-2">Upload and manage your verification documents</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchDocuments}
                disabled={loading}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Upload Document
              </button>
            </div>
          </div>
        </div>

        {/* Verification Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Progress</h2>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Documents Approved</span>
                <span className="text-sm text-gray-500">{approved} / {required} required</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {approved >= required ? (
              <span className="text-green-600 font-medium">✓ Verification complete! You can now access all platform features.</span>
            ) : (
              <span>Upload {required - approved} more document{required - approved > 1 ? 's' : ''} to complete verification.</span>
            )}
          </div>
        </div>

        {/* Upload Document Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Type
                    </label>
                    <select
                      value={uploadData.type}
                      onChange={(e) => setUploadData({ ...uploadData, type: e.target.value as Document['type'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="identity">Identity Document</option>
                      <option value="address">Address Proof</option>
                      <option value="income">Income Proof</option>
                      <option value="bank">Bank Statement</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Name
                    </label>
                    <input
                      type="text"
                      value={uploadData.name}
                      onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Driver License, Passport, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File Upload
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                              required
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                    {selectedFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading || !selectedFile}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Uploading...' : 'Upload Document'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUploadForm(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Documents List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading documents...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                <p className="text-gray-600">Upload your first document to get started with verification.</p>
              </div>
            ) : (
              documents.map((document) => (
                <div key={document.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getTypeIcon(document.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{document.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(document.status)}`}>
                          {document.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {document.type.charAt(0).toUpperCase() + document.type.slice(1)} Document
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Uploaded {formatDate(document.uploadedAt)}</span>
                        {document.reviewedAt && (
                          <>
                            <span>•</span>
                            <span>Reviewed {formatDate(document.reviewedAt)}</span>
                          </>
                        )}
                        {document.reviewer && (
                          <>
                            <span>•</span>
                            <span>By {document.reviewer}</span>
                          </>
                        )}
                      </div>
                      {document.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <strong>Review Notes:</strong> {document.notes}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center space-x-4 mt-4">
                        <a
                          href={document.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Document →
                        </a>
                        {document.status === 'rejected' && (
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Re-upload
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;