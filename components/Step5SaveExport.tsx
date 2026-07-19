'use client';

import { DealInput, ValueMetric, StakeholderPredictions, SalesBrief, SavedCase, ExportSnapshot } from '@/lib/types';
import { useState } from 'react';

interface Step5Props {
  deal: DealInput;
  metrics: ValueMetric[];
  predictions: StakeholderPredictions[];
  brief: SalesBrief;
  savedCases: SavedCase[];
  onSaveCase: (caseData: SavedCase) => void;
  onLoadCase: (caseData: SavedCase) => void;
  onBack: () => void;
}

export function Step5SaveExport({ deal, metrics, predictions, brief, savedCases, onSaveCase, onLoadCase, onBack }: Step5Props) {
  const [caseName, setCaseName] = useState(deal.companyName);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    const newCase: SavedCase = {
      id: `case_${Date.now()}`,
      timestamp: new Date().toISOString(),
      dealInput: deal,
      metrics,
      predictions,
      brief,
    };
    onSaveCase(newCase);
    setCaseName('');
  };

  const handleExport = () => {
    const snapshot: ExportSnapshot = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      case: {
        id: `case_${Date.now()}`,
        timestamp: new Date().toISOString(),
        dealInput: deal,
        metrics,
        predictions,
        brief,
      },
      provenance: {
        allValues: metrics.map(m => ({
          metric: m.name,
          value: m.value.value,
          source: m.value.source,
          description: m.value.description,
        })),
      },
    };

    const json = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saarstahl_${deal.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Step 5: Save & Export</h2>

      <div className="space-y-6">
        {/* Save Section */}
        <section className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 dark:text-green-200 mb-3">Save Analysis</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={caseName}
              onChange={e => setCaseName(e.target.value)}
              placeholder={deal.companyName}
              className="flex-1 px-3 py-2 border border-green-300 dark:border-green-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSave}
              disabled={!caseName}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Save to Browser
            </button>
          </div>
          <p className="text-xs text-green-800 dark:text-green-300">
            Cases are saved locally in your browser. You can load and compare them later.
          </p>
        </section>

        {/* Export Section */}
        <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">Export Analysis</h3>
          <button
            onClick={handleExport}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mb-2"
          >
            Download JSON with Full Provenance
          </button>
          <p className="text-xs text-blue-800 dark:text-blue-300">
            Export includes all calculations, their sources, and AI-generated insights for sharing with stakeholders.
          </p>
        </section>

        {/* Saved Cases */}
        {savedCases.length > 0 && (
          <section>
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="w-full text-left font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2"
            >
              <span className="text-lg">{showSaved ? '▼' : '▶'}</span>
              Saved Cases ({savedCases.length})
            </button>

            {showSaved && (
              <div className="space-y-2">
                {savedCases.map(savedCase => (
                  <div key={savedCase.id} className="border border-slate-200 dark:border-slate-700 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{savedCase.dealInput.companyName}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {savedCase.dealInput.annualVolume.toLocaleString()} tons/year • {new Date(savedCase.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => onLoadCase(savedCase)}
                      className="bg-slate-600 hover:bg-slate-700 text-white text-sm py-1 px-3 rounded transition-colors"
                    >
                      Load
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Start New Analysis
        </button>
      </div>
    </div>
  );
}
