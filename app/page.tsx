'use client';

import { useState, useEffect } from 'react';
import { DealInput, ValueMetric, StakeholderPredictions, SalesBrief, SavedCase } from '@/lib/types';
import { Step1DealInput } from '@/components/Step1DealInput';
import { Step2Metrics } from '@/components/Step2Metrics';
import { Step3Predictions } from '@/components/Step3Predictions';
import { Step3DisplayPredictions } from '@/components/Step3DisplayPredictions';
import { Step4SalesBrief } from '@/components/Step4SalesBrief';
import { Step4DisplayBrief } from '@/components/Step4DisplayBrief';
import { Step5SaveExport } from '@/components/Step5SaveExport';

type WorkflowStep = 'start' | 'metrics' | 'predict' | 'predictions' | 'brief-gen' | 'brief' | 'save';

export default function Home() {
  const [step, setStep] = useState<WorkflowStep>('start');
  const [deal, setDeal] = useState<DealInput | null>(null);
  const [metrics, setMetrics] = useState<ValueMetric[]>([]);
  const [predictions, setPredictions] = useState<StakeholderPredictions[]>([]);
  const [brief, setBrief] = useState<SalesBrief | null>(null);
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);

  // Load saved cases from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saarstahl_cases');
    if (saved) {
      try {
        setSavedCases(JSON.parse(saved));
      } catch (e) {
        console.error('[v0] Failed to load saved cases:', e);
      }
    }
  }, []);

  const handleSaveCase = (caseData: SavedCase) => {
    const updated = [...savedCases, caseData];
    setSavedCases(updated);
    localStorage.setItem('saarstahl_cases', JSON.stringify(updated));
    alert(`Case "${caseData.dealInput.companyName}" saved successfully!`);
  };

  const handleLoadCase = (caseData: SavedCase) => {
    setDeal(caseData.dealInput);
    setMetrics(caseData.metrics);
    setPredictions(caseData.predictions);
    setBrief(caseData.brief || null);
    setStep(caseData.brief ? 'brief' : 'predictions');
  };

  const getStepLabel = (currentStep: WorkflowStep): string => {
    const labels: Record<WorkflowStep, string> = {
      start: '1. Deal Input',
      metrics: '2. Business Value',
      predict: '3. Predictions',
      predictions: '3. Stakeholder Analysis',
      'brief-gen': '4. Sales Brief',
      brief: '5. Sales Brief',
      save: '6. Save & Export',
    };
    return labels[currentStep];
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Saarstahl Green-Steel Simulator
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Value proposition & objection simulator for B2B partnerships
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          {(['start', 'metrics', 'predict', 'predictions', 'brief-gen', 'brief', 'save'] as WorkflowStep[]).map((s, idx) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                  step === s
                    ? 'bg-blue-600 text-white'
                    : ['start', 'metrics', 'predict', 'predictions', 'brief-gen', 'brief', 'save'].indexOf(s) <
                        ['start', 'metrics', 'predict', 'predictions', 'brief-gen', 'brief', 'save'].indexOf(step)
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                }`}
              >
                {idx + 1}
              </div>
              {idx < 6 && (
                <div
                  className={`flex-1 h-1 mx-1 ${
                    ['start', 'metrics', 'predict', 'predictions', 'brief-gen', 'brief', 'save'].indexOf(s) <
                    ['start', 'metrics', 'predict', 'predictions', 'brief-gen', 'brief', 'save'].indexOf(step)
                      ? 'bg-green-600'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
          {getStepLabel(step)}
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {step === 'start' && (
          <Step1DealInput
            onNext={deal => {
              setDeal(deal);
              setStep('metrics');
            }}
          />
        )}

        {step === 'metrics' && deal && (
          <Step2Metrics
            deal={deal}
            onNext={metrics => {
              setMetrics(metrics);
              setStep('predict');
            }}
            onBack={() => setStep('start')}
          />
        )}

        {step === 'predict' && deal && (
          <Step3Predictions
            deal={deal}
            onNext={predictions => {
              setPredictions(predictions);
              setStep('predictions');
            }}
            onBack={() => setStep('metrics')}
          />
        )}

        {step === 'predictions' && predictions.length > 0 && (
          <Step3DisplayPredictions
            predictions={predictions}
            onNext={() => setStep('brief-gen')}
            onBack={() => setStep('predict')}
          />
        )}

        {step === 'brief-gen' && deal && metrics.length > 0 && predictions.length > 0 && (
          <Step4SalesBrief
            deal={deal}
            metrics={metrics}
            predictions={predictions}
            onNext={brief => {
              setBrief(brief);
              setStep('brief');
            }}
            onBack={() => setStep('predictions')}
          />
        )}

        {step === 'brief' && brief && (
          <Step4DisplayBrief
            brief={brief}
            onNext={() => setStep('save')}
            onBack={() => setStep('brief-gen')}
          />
        )}

        {step === 'save' && deal && metrics.length > 0 && predictions.length > 0 && brief && (
          <Step5SaveExport
            deal={deal}
            metrics={metrics}
            predictions={predictions}
            brief={brief}
            savedCases={savedCases}
            onSaveCase={handleSaveCase}
            onLoadCase={handleLoadCase}
            onBack={() => setStep('brief')}
          />
        )}
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
        <p className="text-center text-xs text-slate-600 dark:text-slate-400">
          Saarstahl Green-Steel Simulator • All calculations include full provenance tracking (Calculated/Model/Fallback/Template)
        </p>
      </div>
    </main>
  );
}
