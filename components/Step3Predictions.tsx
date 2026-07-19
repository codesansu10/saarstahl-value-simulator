'use client';

import { DealInput, StakeholderPredictions } from '@/lib/types';
import {
  calculateCostAcceptance,
  calculateEmissionReduction,
  calculatePaybackPeriod,
  calculateRiskScore,
} from '@/lib/calculator';
import { useState } from 'react';

interface Step3Props {
  deal: DealInput;
  onNext: (predictions: StakeholderPredictions[]) => void;
  onBack: () => void;
}

const STAKEHOLDER_OBJECTIONS = {
  CFO: [
    'Premium cost not justified by savings',
    'Carbon credits market volatility',
    'Commitment risk over 5 years',
    'Working capital impact',
  ],
  Sustainability: [
    'Green washing concerns',
    'Third-party verification needed',
    'Supply chain transparency',
    'Scope 3 emissions not covered',
  ],
  Operations: [
    'Production process compatibility',
    'Quality assurance concerns',
    'Supply chain disruption risk',
    'Employee training requirements',
  ],
  Procurement: [
    'Supplier availability',
    'Contract terms flexibility',
    'Price escalation clauses',
    'Alternative green options',
  ],
};

export function Step3Predictions({ deal, onNext, onBack }: Step3Props) {
  const [isLoading, setIsLoading] = useState(false);

  const generatePredictions = (): StakeholderPredictions[] => {
    const payback = calculatePaybackPeriod(deal);
    const costAcceptance = calculateCostAcceptance(deal);
    const emissionReduction = calculateEmissionReduction(deal);
    const riskScore = calculateRiskScore(deal);

    return [
      {
        stakeholder: 'CFO',
        objections: STAKEHOLDER_OBJECTIONS.CFO,
        predictions: {
          costAcceptance,
          emissionReduction,
          paybackMonths: payback,
          riskScore,
        },
      },
      {
        stakeholder: 'Sustainability',
        objections: STAKEHOLDER_OBJECTIONS.Sustainability,
        predictions: {
          costAcceptance: {
            value: Math.min(100, costAcceptance.value + 25),
            source: 'Model',
            description: 'Sustainability team more favorable',
          },
          emissionReduction,
          paybackMonths: payback,
          riskScore: { value: Math.max(0, riskScore.value - 15), source: 'Model' },
        },
      },
      {
        stakeholder: 'Operations',
        objections: STAKEHOLDER_OBJECTIONS.Operations,
        predictions: {
          costAcceptance: {
            value: Math.max(0, costAcceptance.value - 15),
            source: 'Model',
            description: 'Implementation concerns lower acceptance',
          },
          emissionReduction,
          paybackMonths: { value: payback.value * 1.2, source: 'Model' },
          riskScore: { value: Math.min(90, riskScore.value + 20), source: 'Model' },
        },
      },
      {
        stakeholder: 'Procurement',
        objections: STAKEHOLDER_OBJECTIONS.Procurement,
        predictions: {
          costAcceptance: { value: Math.max(0, costAcceptance.value - 10), source: 'Model' },
          emissionReduction,
          paybackMonths: payback,
          riskScore: { value: Math.max(0, riskScore.value - 5), source: 'Model' },
        },
      },
    ];
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      onNext(generatePredictions());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Step 3: Stakeholder Predictions</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Analyzing objections and predicting acceptance from 4 key stakeholder groups based on your deal parameters.
      </p>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-6">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <span className="font-semibold">How it works:</span> The system will predict objections and acceptance likelihood for each stakeholder (CFO, Sustainability, Operations, Procurement) based on your deal parameters. Ready?
        </p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating Predictions...
          </>
        ) : (
          'Generate Multi-Stakeholder Predictions'
        )}
      </button>

      <div className="flex gap-4 mt-6">
        <button
          onClick={onBack}
          className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
