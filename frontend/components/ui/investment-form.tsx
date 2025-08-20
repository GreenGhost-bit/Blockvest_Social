'use client';

import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon, 
  CalendarIcon, 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface InvestmentFormData {
  amount: number;
  purpose: string;
  description: string;
  interestRate: number;
  duration: number;
  collateral?: string;
  repaymentSchedule: string;
  riskFactors: string[];
}

interface InvestmentFormProps {
  onSubmit: (data: InvestmentFormData) => void;
  onCancel: () => void;
  initialData?: Partial<InvestmentFormData>;
  isEditing?: boolean;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  isEditing = false
}) => {
  const [formData, setFormData] = useState<InvestmentFormData>({
    amount: initialData.amount || 0,
    purpose: initialData.purpose || '',
    description: initialData.description || '',
    interestRate: initialData.interestRate || 5,
    duration: initialData.duration || 12,
    collateral: initialData.collateral || '',
    repaymentSchedule: initialData.repaymentSchedule || 'monthly',
    riskFactors: initialData.riskFactors || []
  });

  const [errors, setErrors] = useState<Partial<InvestmentFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<{
    score: number;
    level: string;
    recommendations: string[];
  } | null>(null);

  const riskFactorOptions = [
    'No formal credit history',
    'Limited income documentation',
    'New business venture',
    'Seasonal income',
    'Geographic risk',
    'Industry volatility',
    'Personal financial stress',
    'Limited collateral'
  ];

  const repaymentOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'custom', label: 'Custom Schedule' }
  ];

  const purposeOptions = [
    'Business expansion',
    'Equipment purchase',
    'Working capital',
    'Debt consolidation',
    'Education',
    'Home improvement',
    'Medical expenses',
    'Emergency fund',
    'Investment opportunity',
    'Other'
  ];

  useEffect(() => {
    if (formData.amount > 0 && formData.duration > 0) {
      assessRisk();
    }
  }, [formData.amount, formData.duration, formData.riskFactors]);

  const assessRisk = async () => {
    try {
      // Mock risk assessment - replace with actual API call
      const mockAssessment = {
        score: Math.floor(Math.random() * 40) + 30, // 30-70 range
        level: 'medium',
        recommendations: [
          'Consider providing additional documentation',
          'Higher interest rate may be required',
          'Shorter duration recommended'
        ]
      };
      setRiskAssessment(mockAssessment);
    } catch (error) {
      console.error('Error assessing risk:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<InvestmentFormData> = {};

    if (!formData.amount || formData.amount < 100) {
      newErrors.amount = 'Amount must be at least $100';
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.interestRate < 1 || formData.interestRate > 25) {
      newErrors.interestRate = 'Interest rate must be between 1% and 25%';
    }

    if (formData.duration < 1 || formData.duration > 60) {
      newErrors.duration = 'Duration must be between 1 and 60 months';
    }

    if (formData.riskFactors.length === 0) {
      newErrors.riskFactors = 'Please select at least one risk factor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof InvestmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRiskFactorToggle = (factor: string) => {
    const newFactors = formData.riskFactors.includes(factor)
      ? formData.riskFactors.filter(f => f !== factor)
      : [...formData.riskFactors, factor];
    
    handleInputChange('riskFactors', newFactors);
  };

  const calculateMonthlyPayment = () => {
    if (formData.amount <= 0 || formData.interestRate <= 0 || formData.duration <= 0) {
      return 0;
    }

    const monthlyRate = formData.interestRate / 100 / 12;
    const totalPayments = formData.duration;
    
    if (monthlyRate === 0) {
      return formData.amount / totalPayments;
    }

    const monthlyPayment = formData.amount * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    return monthlyPayment;
  };

  const calculateTotalRepayment = () => {
    const monthlyPayment = calculateMonthlyPayment();
    return monthlyPayment * formData.duration;
  };

  const getRiskLevelColor = (level: string) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-red-600 bg-red-100'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Edit Investment Request' : 'Create Investment Request'}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Fill out the form below to create your investment request. Be detailed and honest about your needs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Amount and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Investment Amount ($)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="1000"
                min="100"
                step="100"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Duration (months)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.duration ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="12"
                min="1"
                max="60"
              />
            </div>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
            )}
          </div>
        </div>

        {/* Purpose and Interest Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
              Investment Purpose
            </label>
            <select
              id="purpose"
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.purpose ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select a purpose</option>
              {purposeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
            )}
          </div>

          <div>
            <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-2">
              Interest Rate (%)
            </label>
            <input
              type="number"
              id="interestRate"
              value={formData.interestRate}
              onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.interestRate ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="5.0"
              min="1"
              max="25"
              step="0.1"
            />
            {errors.interestRate && (
              <p className="mt-1 text-sm text-red-600">{errors.interestRate}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Description
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Please provide a detailed description of your investment request, including how you plan to use the funds and your repayment strategy..."
            />
          </div>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Repayment Schedule */}
        <div>
          <label htmlFor="repaymentSchedule" className="block text-sm font-medium text-gray-700 mb-2">
            Repayment Schedule
          </label>
          <select
            id="repaymentSchedule"
            value={formData.repaymentSchedule}
            onChange={(e) => handleInputChange('repaymentSchedule', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {repaymentOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Risk Factors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Risk Factors (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {riskFactorOptions.map((factor) => (
              <label key={factor} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.riskFactors.includes(factor)}
                  onChange={() => handleRiskFactorToggle(factor)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{factor}</span>
              </label>
            ))}
          </div>
          {errors.riskFactors && (
            <p className="mt-1 text-sm text-red-600">{errors.riskFactors}</p>
          )}
        </div>

        {/* Risk Assessment */}
        {riskAssessment && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
              <h3 className="text-sm font-medium text-gray-900">Risk Assessment</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Risk Score</p>
                <p className="text-lg font-semibold text-gray-900">{riskAssessment.score}/100</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Risk Level</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(riskAssessment.level)}`}>
                  {riskAssessment.level}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Recommendations</p>
                <p className="text-sm text-gray-900">{riskAssessment.recommendations.length}</p>
              </div>
            </div>
            {riskAssessment.recommendations.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Recommendations:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {riskAssessment.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Payment Summary */}
        {formData.amount > 0 && formData.duration > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-3">Payment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-600">Monthly Payment</p>
                <p className="font-semibold text-blue-900">${calculateMonthlyPayment().toFixed(2)}</p>
              </div>
              <div>
                <p className="text-blue-600">Total Repayment</p>
                <p className="font-semibold text-blue-900">${calculateTotalRepayment().toFixed(2)}</p>
              </div>
              <div>
                <p className="text-blue-600">Total Interest</p>
                <p className="font-semibold text-blue-900">${(calculateTotalRepayment() - formData.amount).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : (isEditing ? 'Update Request' : 'Create Request')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvestmentForm;
