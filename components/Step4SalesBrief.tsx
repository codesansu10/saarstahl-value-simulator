'use client';

import { DealInput, ValueMetric, StakeholderPredictions, SalesBrief } from '@/lib/types';
import { useState } from 'react';

interface Step4Props {
  deal: DealInput;
  metrics: ValueMetric[];
  predictions: StakeholderPredictions[];
  onNext: (brief: SalesBrief) => void;
  onBack: () => void;
}

export function Step4SalesBrief({ deal, metrics, predictions, onNext, onBack }: Step4Props) {
  const [isLoading, setIsLoading] = useState(false);

  const generateBrief = async (): Promise<SalesBrief> => {
    const payback = metrics.find(m => m.name === 'Payback Period');
    const costPremium = metrics.find(m => m.name === 'Annual Cost Premium');
    const co2Reduction = metrics.find(m => m.name === 'Annual CO2 Reduction');

    const brief: SalesBrief = {
      title: `Green Steel Partnership: ${deal.companyName}`,
      executiveSummary: `Strategic partnership to transition ${deal.annualVolume.toLocaleString()} tons/year of ${deal.steelType} steel production to certified green steel. Full carbon credit offset within ${Math.round(payback?.value.value || 12)} months.`,
      valueProp: `${deal.companyName} achieves Scope 1 & 2 carbon neutrality in steel procurement while maintaining production schedules. Payback through €${Math.round(co2Reduction?.value.value || 0)} annual carbon credits.`,
      keyMetrics: metrics,
      stakeholderApproaches: predictions.map(pred => ({
        stakeholder: pred.stakeholder,
        pitch:
          pred.stakeholder === 'CFO'
            ? `Premium offset by carbon credits within ${Math.round(pred.predictions.paybackMonths.value)} months. Improves ESG positioning for investor relations.`
            : pred.stakeholder === 'Sustainability'
              ? `${Math.round(co2Reduction?.value.value || 0)} tons CO₂ reduction annually aligns with net-zero commitments. Third-party certified.`
              : pred.stakeholder === 'Operations'
                ? `Proven production compatibility. Zero downtime transition plan. Full training and support included.`
                : `Secure supply through 5-year contract. Volume lock-in prevents future price volatility.`,
        counterArguments: pred.objections,
      })),
      closingStrategy: `Focus on payback ROI with CFO. Lead with ESG impact for Sustainability. Emphasize operational continuity with Operations. Lock supply contract with Procurement.`,
      provenance: {
        timestamp: new Date().toISOString(),
        dataSourcesUsed: ['Calculated', 'Model', 'Fallback', 'Template'],
        modelVersion: '1.0-beta',
      },
    };

    return brief;
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const brief = await generateBrief();
      await new Promise(resolve => setTimeout(resolve, 600));
      onNext(brief);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Step 4: Sales Brief</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Generate a personalized sales brief tailored to each stakeholder with objection responses.
      </p>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg mb-6">
        <p className="text-sm text-purple-900 dark:text-purple-200">
          <span className="font-semibold">What&apos;s included:</span> Executive summary, stakeholder-specific pitches, objection responses, and a closing strategy. All data points are tagged with their source (Calculated/Model/Fallback/Template).
        </p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating Sales Brief...
          </>
        ) : (
          'Generate Sales Brief'
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
