'use client';

import { DealInput, ValueMetric } from '@/lib/types';
import { calculateBusinessValue } from '@/lib/calculator';

interface Step2Props {
  deal: DealInput;
  onNext: (metrics: ValueMetric[]) => void;
  onBack: () => void;
}

const getSourceColor = (source: string) => {
  switch (source) {
    case 'Calculated':
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    case 'Model':
      return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
    case 'Fallback':
      return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    case 'Template':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    default:
      return 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
  }
};

const getSourceBadgeColor = (source: string) => {
  switch (source) {
    case 'Calculated':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    case 'Model':
      return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
    case 'Fallback':
      return 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200';
    case 'Template':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200';
  }
};

export function Step2Metrics({ deal, onNext, onBack }: Step2Props) {
  const metrics = calculateBusinessValue(deal);

  const formatValue = (value: number, unit: string): string => {
    if (unit === 'EUR') {
      return `€${value.toLocaleString('de-DE', { maximumFractionDigits: 0 })}`;
    }
    if (unit === 'tons CO2') {
      return `${value.toLocaleString('de-DE', { maximumFractionDigits: 0 })} t`;
    }
    if (unit === 'months') {
      return `${Math.round(value)} months`;
    }
    return `${value.toLocaleString('de-DE', { maximumFractionDigits: 2 })} ${unit}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Step 2: Business Value Analysis</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Deal: <span className="font-semibold">{deal.companyName}</span> ({deal.annualVolume.toLocaleString()} tons/year)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {metrics.map((metric, idx) => (
          <div key={idx} className={`p-4 border rounded-lg ${getSourceColor(metric.value.source)}`}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-slate-900 dark:text-white">{metric.name}</h3>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getSourceBadgeColor(metric.value.source)}`}>
                {metric.value.source}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {formatValue(metric.value.value, metric.unit)}
            </div>
            {metric.value.description && (
              <p className="text-xs text-slate-600 dark:text-slate-400">{metric.value.description}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg mb-6">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <span className="font-semibold">What this means:</span> {deal.companyName} can offset the green steel cost premium through carbon credits within{' '}
          <span className="font-bold text-green-600 dark:text-green-400">
            {Math.round(metrics.find(m => m.name === 'Payback Period')?.value.value || 12)} months
          </span>
          . All calculations are fully traceable to their source (Calculated, Model, Fallback, or Template).
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => onNext(metrics)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Next: Get Predictions
        </button>
      </div>
    </div>
  );
}
