'use client';

import { StakeholderPredictions } from '@/lib/types';

interface DisplayPredictionsProps {
  predictions: StakeholderPredictions[];
  onNext: () => void;
  onBack: () => void;
}

const getScoreColor = (score: number): string => {
  if (score >= 70) return 'text-green-600 dark:text-green-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

const getScoreBgColor = (score: number): string => {
  if (score >= 70) return 'bg-green-50 dark:bg-green-900/20';
  if (score >= 50) return 'bg-amber-50 dark:bg-amber-900/20';
  return 'bg-red-50 dark:bg-red-900/20';
};

export function Step3DisplayPredictions({ predictions, onNext, onBack }: DisplayPredictionsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Stakeholder Predictions</h2>

      <div className="space-y-6">
        {predictions.map((pred, idx) => (
          <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{pred.stakeholder}</h3>
              <div className={`text-right ${getScoreBgColor(pred.predictions.costAcceptance.value)} p-3 rounded-lg`}>
                <div className={`text-2xl font-bold ${getScoreColor(pred.predictions.costAcceptance.value)}`}>
                  {Math.round(pred.predictions.costAcceptance.value)}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Acceptance</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Payback Period</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {Math.round(pred.predictions.paybackMonths.value)} months
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Risk Score</div>
                <div className={`text-lg font-bold ${getScoreColor(pred.predictions.riskScore.value)}`}>
                  {Math.round(pred.predictions.riskScore.value)}/100
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Key Objections:</p>
              <ul className="space-y-1">
                {pred.objections.map((obj, objIdx) => (
                  <li key={objIdx} className="text-sm text-slate-600 dark:text-slate-400 flex gap-2">
                    <span className="text-amber-500">•</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Next: Generate Sales Brief
        </button>
      </div>
    </div>
  );
}
