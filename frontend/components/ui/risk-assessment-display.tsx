'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from './wallet-provider';
import api from '../../lib/api';

interface RiskFactor {
  factor: string;
  value: any;
  weight: number;
  score: number;
  reasoning: string;
}

interface CategoryScore {
  score: number;
  weight: number;
  factors: string[];
}

interface Recommendation {
  type: 'approve' | 'conditional_approve' | 'request_more_info' | 'reject' | 'monitor';
  reasoning: string;
  conditions?: string[];
  suggestedInterestRate?: {
    min: number;
    max: number;
  };
  suggestedAmount?: {
    min: number;
    max: number;
  };
  monitoringFlags?: string[];
}

interface RiskAssessment {
  id: string;
  overallRiskScore: number;
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  categoryScores: Record<string, CategoryScore>;
  riskFactors?: RiskFactor[];
  recommendations: Recommendation[];
  assessedAt: string;
  confidence: number;
  nextReassessment?: string;
  borrower?: {
    name: string;
    reputationScore: number;
  };
}

interface RiskAssessmentDisplayProps {
  investmentId: string;
  showDetailed?: boolean;
  onAssessmentUpdate?: (assessment: RiskAssessment) => void;
}

const RiskAssessmentDisplay: React.FC<RiskAssessmentDisplayProps> = ({
  investmentId,
  showDetailed = false,
  onAssessmentUpdate
}) => {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const { user } = useWallet();
  const isAdmin = user?.profile?.userType === 'admin';

  useEffect(() => {
    fetchAssessment();
  }, [investmentId]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/risk-assessment/investment/${investmentId}`);
      setAssessment(response.assessment);
      if (onAssessmentUpdate) {
        onAssessmentUpdate(response.assessment);
      }
    } catch (err: any) {
      if (err.message.includes('404')) {
        setError('No risk assessment available');
      } else {
        setError('Failed to load risk assessment');
      }
      console.error('Risk assessment fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAssessment = async () => {
    try {
      setGenerating(true);
      setError(null);
      const response = await api.post(`/risk-assessment/assess/${investmentId}`);
      setAssessment(response.assessment);
      if (onAssessmentUpdate) {
        onAssessmentUpdate(response.assessment);
      }
    } catch (err) {
      setError('Failed to generate risk assessment');
      console.error('Risk assessment generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'very_low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'very_high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelLabel = (level: string) => {
    return level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'approve':
        return '✅';
      case 'conditional_approve':
        return '⚠️';
      case 'request_more_info':
        return '📋';
      case 'reject':
        return '❌';
      case 'monitor':
        return '👁️';
      default:
        return '❓';
    }
  };

  const formatCategoryName = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatFactorName = (factor: string) => {
    return factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-green-500';
    if (score >= 45) return 'text-yellow-600';
    if (score >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Risk Assessment Needed</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={generateAssessment}
            disabled={generating}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Risk Assessment'}
          </button>
        </div>
      </div>
    );
  }

  if (!assessment) return null;

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Confidence: {Math.round(assessment.confidence * 100)}%</span>
            {isAdmin && (
              <button
                onClick={generateAssessment}
                disabled={generating}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {generating ? 'Updating...' : 'Reassess'}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(assessment.overallRiskScore)}`}>
                {assessment.overallRiskScore}
              </div>
              <div className="text-sm text-gray-500">Risk Score</div>
            </div>
            <div className={`px-4 py-2 rounded-lg border ${getRiskLevelColor(assessment.riskLevel)}`}>
              <span className="font-medium">{getRiskLevelLabel(assessment.riskLevel)} Risk</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Assessed</div>
            <div className="text-sm font-medium">{new Date(assessment.assessedAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Category Scores */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Categories</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(assessment.categoryScores).map(([category, data]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-gray-900">{formatCategoryName(category)}</h5>
                <span className={`text-lg font-bold ${getScoreColor(data.score)}`}>
                  {Math.round(data.score)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    data.score >= 65 ? 'bg-green-500' :
                    data.score >= 45 ? 'bg-yellow-500' :
                    data.score >= 25 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${data.score}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Weight: {Math.round(data.weight * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h4>
        <div className="space-y-4">
          {assessment.recommendations.map((rec, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{getRecommendationIcon(rec.type)}</div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-2">
                    {rec.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h5>
                  <p className="text-sm text-gray-600 mb-3">{rec.reasoning}</p>
                  
                  {rec.conditions && rec.conditions.length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-sm font-medium text-gray-900 mb-1">Conditions:</h6>
                      <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                        {rec.conditions.map((condition, idx) => (
                          <li key={idx}>{condition}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rec.suggestedInterestRate && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Suggested Interest Rate:</span>
                        <span className="ml-2 font-medium">
                          {rec.suggestedInterestRate.min}% - {rec.suggestedInterestRate.max}%
                        </span>
                      </div>
                      {rec.suggestedAmount && (
                        <div>
                          <span className="text-gray-500">Amount Multiplier:</span>
                          <span className="ml-2 font-medium">
                            {Math.round(rec.suggestedAmount.min * 100)}% - {Math.round(rec.suggestedAmount.max * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {rec.monitoringFlags && rec.monitoringFlags.length > 0 && (
                    <div className="mt-3">
                      <h6 className="text-sm font-medium text-gray-900 mb-1">Monitoring Required:</h6>
                      <div className="flex flex-wrap gap-1">
                        {rec.monitoringFlags.map((flag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                          >
                            {flag.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Risk Factors (Admin Only) */}
      {showDetailed && isAdmin && assessment.riskFactors && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Detailed Risk Factors</h4>
          <div className="space-y-3">
            {assessment.riskFactors.map((factor, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-900">
                    {formatFactorName(factor.factor)}
                  </h5>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Weight: {Math.round(factor.weight * 100)}%
                    </span>
                    <span className={`text-lg font-bold ${getScoreColor(factor.score)}`}>
                      {Math.round(factor.score)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${
                      factor.score >= 65 ? 'bg-green-500' :
                      factor.score >= 45 ? 'bg-yellow-500' :
                      factor.score >= 25 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{factor.reasoning}</p>
                <div className="text-xs text-gray-500 mt-1">
                  Value: {typeof factor.value === 'object' ? JSON.stringify(factor.value) : factor.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {assessment.nextReassessment && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-800">
              Next reassessment scheduled for {new Date(assessment.nextReassessment).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAssessmentDisplay;