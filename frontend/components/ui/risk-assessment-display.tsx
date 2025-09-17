'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

interface RiskAssessment {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: Array<{
    name: string;
    score: number;
    weight: number;
    description: string;
  }>;
  recommendations: string[];
  lastUpdated: string;
}

interface RiskAssessmentDisplayProps {
  investmentId: string;
  showDetailed?: boolean;
}

const RiskAssessmentDisplay: React.FC<RiskAssessmentDisplayProps> = ({ 
  investmentId, 
  showDetailed = false 
}) => {
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRiskAssessment();
  }, [investmentId]);

  const fetchRiskAssessment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API call
      const mockAssessment: RiskAssessment = {
        overallScore: 65,
        riskLevel: 'medium',
        factors: [
          {
            name: 'Credit History',
            score: 70,
            weight: 0.3,
            description: 'Based on previous investment performance'
          },
          {
            name: 'Repayment Capacity',
            score: 60,
            weight: 0.25,
            description: 'Analysis of borrower\'s income and expenses'
          },
          {
            name: 'Investment Purpose',
            score: 80,
            weight: 0.2,
            description: 'Evaluation of the stated purpose and feasibility'
          },
          {
            name: 'Market Conditions',
            score: 50,
            weight: 0.15,
            description: 'Current economic and market factors'
          },
          {
            name: 'Social Verification',
            score: 75,
            weight: 0.1,
            description: 'Social proof and community verification'
          }
        ],
        recommendations: [
          'Consider requesting additional documentation',
          'Monitor repayment schedule closely',
          'Set up automated reminders',
          'Consider partial funding initially'
        ],
        lastUpdated: new Date().toISOString()
      };
      
      setRiskAssessment(mockAssessment);
    } catch (err) {
      setError('Failed to load risk assessment');
      console.error('Risk assessment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading risk assessment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-2">{error}</div>
        <button 
          onClick={fetchRiskAssessment}
          className="text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!riskAssessment) {
    return (
      <div className="text-center p-8 text-gray-500">
        No risk assessment available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-4">
          <div className="text-6xl font-bold text-gray-900">
            {riskAssessment.overallScore}
          </div>
          <div className="text-left">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(riskAssessment.riskLevel)}`}>
              {riskAssessment.riskLevel.toUpperCase()} RISK
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(riskAssessment.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors</h4>
        <div className="space-y-4">
          {riskAssessment.factors.map((factor, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{factor.name}</h5>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-bold ${getScoreColor(factor.score)}`}>
                    {factor.score}
                  </span>
                  <span className="text-sm text-gray-500">/100</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{factor.description}</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      factor.score >= 80 ? 'bg-green-500' :
                      factor.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">
                  Weight: {Math.round(factor.weight * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {showDetailed && riskAssessment.recommendations.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul className="space-y-2">
              {riskAssessment.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-blue-800">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Risk Level Explanation */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Risk Level Explanation</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Low Risk (80-100):</strong> Excellent credit profile with high likelihood of repayment</p>
          <p><strong>Medium Risk (60-79):</strong> Good credit profile with moderate risk factors</p>
          <p><strong>High Risk (0-59):</strong> Higher risk profile requiring careful consideration</p>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentDisplay;