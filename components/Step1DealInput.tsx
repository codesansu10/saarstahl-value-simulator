'use client';

import { DealInput } from '@/lib/types';
import { useState } from 'react';

interface Step1Props {
  onNext: (deal: DealInput) => void;
}

const MERCEDES_EXAMPLE: DealInput = {
  companyName: 'Mercedes-Benz Manufacturing',
  steelType: 'highgrade',
  annualVolume: 15000,
  currentCost: 850,
  productionEmissions: 2.8,
  yearsCommitment: 5,
};

export function Step1DealInput({ onNext }: Step1Props) {
  const [deal, setDeal] = useState<DealInput>(MERCEDES_EXAMPLE);

  const handleChange = (field: keyof DealInput, value: string | number) => {
    setDeal(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'companyName' && field !== 'steelType' ? Number(value) : value,
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Step 1: Deal Input</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Name</label>
          <input
            type="text"
            value={deal.companyName}
            onChange={e => handleChange('companyName', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Currently showing Mercedes-Benz example</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Steel Type</label>
          <select
            value={deal.steelType}
            onChange={e => handleChange('steelType', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="commodity">Commodity</option>
            <option value="special">Special/Alloy</option>
            <option value="highgrade">High-Grade/Premium</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Annual Volume (tons)
          </label>
          <input
            type="number"
            value={deal.annualVolume}
            onChange={e => handleChange('annualVolume', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Current Cost (EUR per ton)
          </label>
          <input
            type="number"
            value={deal.currentCost}
            onChange={e => handleChange('currentCost', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Production Emissions (kg CO₂ per ton)
          </label>
          <input
            type="number"
            step="0.1"
            value={deal.productionEmissions}
            onChange={e => handleChange('productionEmissions', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Years Commitment
          </label>
          <input
            type="number"
            value={deal.yearsCommitment}
            onChange={e => handleChange('yearsCommitment', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        onClick={() => onNext(deal)}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Next: View Business Value
      </button>
    </div>
  );
}
