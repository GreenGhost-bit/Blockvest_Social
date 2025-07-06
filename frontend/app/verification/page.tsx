'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../components/ui/wallet-provider';
import DocumentUpload from '../../components/ui/document-upload';
import api from '../../lib/api';

interface Document {
  id: string;
  type: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  verificationStatus: 'pending' | 'in_review' | 'verified' | 'rejected' | 'expired';
  verifiedAt?: string;
  rejectionReason?: string;
  uploadedAt: string;
  metadata: {
    documentNumber?: string;
    issueDate?: string;
    issuingAuthority?: string;
    confidence?: number;
  };
  securityChecks: {
    virusScan: { status: string; scannedAt?: string };
    duplicateCheck: { status: string; checkedAt?: string };
    formatValidation: { isValid: boolean; validatedAt?: string };
  };
  algorandTxId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    walletAddress: string;
    reputationScore: number;
  };
}

const VerificationPage: React.FC = () => {
  const { isConnected, user } = useWallet();
  const [activeTab, setActiveTab] = useState<'upload' | 'my-documents' | 'admin-queue'>('upload');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [queueDocuments, setQueueDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const isAdmin = user?.profile?.userType === 'admin' || user?.isVerified;

  useEffect(() => {
    if (isConnected) {
      fetchMyDocuments();
      if (isAdmin) {
        fetchVerificationQueue();
        fetchStats();
      }
    }
  }, [isConnected, isAdmin]);

  const fetchMyDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/documents/my-documents');
      setDocuments(response.documents);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error('Fetch documents error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationQueue = async () => {
    try {
      const response = await api.get('/documents/verification-queue');
      setQueueDocuments(response.documents);
    } catch (err) {
      console.error('Fetch verification queue error:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/documents/stats');
      setStats(response);
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  const handleVerifyDocument = async (documentId: string, algorandTxId?: string) => {
    try {
      await api.put(`/documents/${documentId}/verify`, { algorandTxId });
      await fetchVerificationQueue();
      await fetchStats();
    } catch (err) {
      setError('Failed to verify document');
      console.error('Verify document error:', err);
    }
  };

  const handleRejectDocument = async (documentId: string, reason: string) => {
    try {
      await api.put(`/documents/${documentId}/reject`, { reason });
      await fetchVerificationQueue();
      await fetchStats();
    } catch (err) {
      setError('Failed to reject document');
      console.error('Reject document error:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      government_id: 'Government ID',
      passport: 'Passport',
      drivers_license: 'Driver\'s License',
      bank_statement: 'Bank Statement',
      utility_bill: 'Utility Bill',
      income_proof: 'Income Proof',
      business_registration: 'Business Registration',
      tax_document: 'Tax Document',
      other: 'Other'
    };
    return types[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">
            Please connect your wallet to access document verification
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Document Verification</h1>
          <p className="text-gray-600 mt-2">
            Upload and manage your verification documents for platform access
          </p>
        </div>

        {/* Stats Cards (Admin Only) */}
        {isAdmin && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Documents</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.metrics.totalDocuments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Review</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.metrics.pendingReview}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Verification Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.metrics.verificationRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Today's Uploads</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.metrics.todayUploads}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upload Documents
              </button>
              <button
                onClick={() => setActiveTab('my-documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Documents ({documents.length})
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin-queue')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'admin-queue'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Verification Queue ({queueDocuments.length})
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {activeTab === 'upload' && (
              <DocumentUpload 
                onUploadSuccess={fetchMyDocuments}
                onUploadError={setError}
              />
            )}

            {activeTab === 'my-documents' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Documents</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading documents...</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                    <p className="text-gray-600">Upload your first verification document to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((document) => (
                      <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{getDocumentTypeLabel(document.type)}</h4>
                              <p className="text-sm text-gray-600">{document.originalName} • {formatFileSize(document.fileSize)}</p>
                              <p className="text-xs text-gray-500">Uploaded {formatDate(document.uploadedAt)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(document.verificationStatus)}`}>
                              {document.verificationStatus.replace('_', ' ')}
                            </span>
                            {document.algorandTxId && (
                              <p className="text-xs text-green-600 mt-1">Blockchain verified</p>
                            )}
                          </div>
                        </div>
                        
                        {document.metadata.documentNumber && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              {document.metadata.documentNumber && (
                                <div>
                                  <span className="text-gray-500">Document Number:</span>
                                  <span className="ml-2 font-medium">{document.metadata.documentNumber}</span>
                                </div>
                              )}
                              {document.metadata.issueDate && (
                                <div>
                                  <span className="text-gray-500">Issue Date:</span>
                                  <span className="ml-2 font-medium">{formatDate(document.metadata.issueDate)}</span>
                                </div>
                              )}
                              {document.metadata.issuingAuthority && (
                                <div>
                                  <span className="text-gray-500">Issuing Authority:</span>
                                  <span className="ml-2 font-medium">{document.metadata.issuingAuthority}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {document.rejectionReason && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                              <p className="text-sm text-red-800">
                                <span className="font-medium">Rejection Reason:</span> {document.rejectionReason}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'admin-queue' && isAdmin && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Queue</h3>
                {queueDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents pending</h3>
                    <p className="text-gray-600">All documents have been reviewed</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {queueDocuments.map((document) => (
                      <div key={document.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900">{getDocumentTypeLabel(document.type)}</h4>
                              <p className="text-sm text-gray-600">{document.originalName} • {formatFileSize(document.fileSize)}</p>
                              <div className="mt-2 text-sm text-gray-600">
                                <p><span className="font-medium">User:</span> {document.user?.name} ({document.user?.email})</p>
                                <p><span className="font-medium">Reputation:</span> {document.user?.reputationScore}/100</p>
                                <p><span className="font-medium">Uploaded:</span> {formatDate(document.uploadedAt)}</p>
                              </div>
                              
                              {document.metadata.documentNumber && (
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  {document.metadata.documentNumber && (
                                    <div>
                                      <span className="text-gray-500">Document Number:</span>
                                      <span className="ml-2 font-medium">{document.metadata.documentNumber}</span>
                                    </div>
                                  )}
                                  {document.metadata.issueDate && (
                                    <div>
                                      <span className="text-gray-500">Issue Date:</span>
                                      <span className="ml-2 font-medium">{formatDate(document.metadata.issueDate)}</span>
                                    </div>
                                  )}
                                  {document.metadata.issuingAuthority && (
                                    <div>
                                      <span className="text-gray-500">Issuing Authority:</span>
                                      <span className="ml-2 font-medium">{document.metadata.issuingAuthority}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="mt-3 flex space-x-4 text-sm">
                                <div className={`flex items-center space-x-1 ${
                                  document.securityChecks.virusScan.status === 'clean' ? 'text-green-600' : 
                                  document.securityChecks.virusScan.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                  </svg>
                                  <span>Virus scan: {document.securityChecks.virusScan.status}</span>
                                </div>
                                <div className={`flex items-center space-x-1 ${
                                  document.securityChecks.duplicateCheck.status === 'unique' ? 'text-green-600' : 
                                  document.securityChecks.duplicateCheck.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span>Duplicate check: {document.securityChecks.duplicateCheck.status}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleVerifyDocument(document.id)}
                              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Please provide a reason for rejection:');
                                if (reason) {
                                  handleRejectDocument(document.id, reason);
                                }
                              }}
                              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;