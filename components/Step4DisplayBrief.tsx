'use client';

import { SalesBrief } from '@/lib/types';

interface DisplayBriefProps {
  brief: SalesBrief;
  onNext: () => void;
  onBack: () => void;
}

export function Step4DisplayBrief({ brief, onNext, onBack }: DisplayBriefProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{brief.title}</h2>

      <div className="space-y-6">
        {/* Executive Summary */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Executive Summary</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{brief.executiveSummary}</p>
        </section>

        {/* Value Proposition */}
        <section className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-2">Value Proposition</h3>
          <p className="text-green-800 dark:text-green-300">{brief.valueProp}</p>
        </section>

        {/* Key Metrics */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Key Business Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brief.keyMetrics.slice(0, 4).map((metric, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{metric.name}</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {metric.value.value.toLocaleString('de-DE', { maximumFractionDigits: 0 })} {metric.unit}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">{metric.value.source}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Stakeholder Approaches */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Stakeholder Approaches</h3>
          <div className="space-y-4">
            {brief.stakeholderApproaches.map((approach, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{approach.stakeholder}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                  {approach.pitch}
                </p>
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Expected Objections:</p>
                  <ul className="space-y-1">
                    {approach.counterArguments.map((arg, argIdx) => (
                      <li key={argIdx} className="text-xs text-slate-600 dark:text-slate-400 flex gap-2">
                        <span className="text-slate-400">•</span>
                        {arg}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Closing Strategy */}
        <section className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
          <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Closing Strategy</h3>
          <p className="text-amber-800 dark:text-amber-300 text-sm">{brief.closingStrategy}</p>
        </section>

        {/* Provenance */}
        <section className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-xs text-slate-600 dark:text-slate-400">
          <p>
            <span className="font-semibold">Data Provenance:</span> Generated {new Date(brief.provenance.timestamp).toLocaleDateString()} using sources:{' '}
            {brief.provenance.dataSourcesUsed.join(', ')}
          </p>
        </section>
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
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Next: Save & Export
        </button>
      </div>
    </div>
  );
}
