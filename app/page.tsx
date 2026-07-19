'use client'

import { useCallback, useState, useMemo } from 'react'
import { Loader2, RefreshCw, Download } from 'lucide-react'
import type { DealInput, PredictionResponse, Stakeholder } from '@/lib/types'
import { STAKEHOLDERS } from '@/lib/types'
import { createMercedesExample } from '@/lib/defaults'
import { calculateBusinessValue } from '@/lib/value-calculator'
import { validateDeal, isDealValid } from '@/lib/validation'
import { buildFeatureRows } from '@/lib/feature-engineering'
import { fetchPrediction, fetchBrief } from '@/lib/api-client'
import { loadCases, saveCase, deleteCase } from '@/lib/storage'
import { buildCaseExport, downloadJson } from '@/lib/export'
import type { BriefResult } from '@/lib/brief-schema'

import { SideNav } from '@/components/side-nav'
import { DealInputForm } from '@/components/deal-input-form'
import { BusinessValuePanel } from '@/components/business-value-panel'
import { ModelStatusBanner } from '@/components/model-status-banner'
import { StakeholderPredictions } from '@/components/stakeholder-predictions'
import { StakeholderPieChart } from '@/components/stakeholder-pie-chart'
import { SalesBriefPanel } from '@/components/sales-brief-panel'

type NavItem = 'calculator' | 'impact' | 'stakeholder' | 'brief'

export default function SimulatorPage() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<NavItem>('calculator')

  // Deal state
  const [deal, setDeal] = useState<DealInput>(createMercedesExample())
  const errors = validateDeal(deal)
  const valid = isDealValid(deal)

  // Calculation state
  const output = useMemo(() => calculateBusinessValue(deal), [deal])
  const features = useMemo(() => buildFeatureRows(deal, output), [deal, output])

  // Prediction state
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [activeStakeholder, setActiveStakeholder] = useState<Stakeholder>('Procurement')

  // Brief state
  const [brief, setBrief] = useState<BriefResult | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)

  // Handlers
  const handleDealChange = useCallback((patch: Partial<DealInput>) => {
    setDeal((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleRunPrediction = useCallback(async () => {
    if (!valid) return
    setPredictionLoading(true)
    try {
      const pred = await fetchPrediction(deal, output)
      setPrediction(pred)
    } catch (err) {
      console.error('[v0] Prediction error:', err)
    } finally {
      setPredictionLoading(false)
    }
  }, [deal, output, valid])

  const handleGenerateBrief = useCallback(async () => {
    if (!prediction) return
    setBriefLoading(true)
    try {
      // Find the prediction for the active stakeholder
      const stakeholderPred = prediction.predictions.find(
        (p) => p.stakeholder === activeStakeholder,
      )
      if (!stakeholderPred) throw new Error('Stakeholder prediction not found')
      const b = await fetchBrief(deal, output, stakeholderPred, activeStakeholder)
      setBrief(b)
    } catch (err) {
      console.error('[v0] Brief error:', err)
    } finally {
      setBriefLoading(false)
    }
  }, [deal, output, prediction, activeStakeholder])

  const handleExport = useCallback(() => {
    if (!output) return
    const exp = buildCaseExport({
      deal,
      output,
      features,
      prediction,
      brief: brief ? brief.brief : null,
      provenance: { general: 'Calculated' },
    })
    downloadJson(`deal-${deal.companyName}`, exp)
  }, [deal, output, features, prediction, brief, activeStakeholder])

  return (
    <div className="flex h-screen bg-background">
      {/* Side Navigation */}
      <SideNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Step 1: Calculator */}
        {activeTab === 'calculator' && (
          <div className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                  Business Value Calculator
                </h1>
                <p className="text-muted-foreground mt-2">
                  Enter deal information to calculate the business impact of green steel
                </p>
              </div>

              <DealInputForm
                deal={deal}
                onChange={handleDealChange}
                errors={errors}
              />

              <button
                onClick={() => setActiveTab('impact')}
                disabled={!valid}
                className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate Impact
                <RefreshCw className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Impact Dashboard */}
        {activeTab === 'impact' && (
          <div className="flex-1 overflow-auto">
            <div className="p-8 h-full flex flex-col">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                  Business Impact Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                  Overview of the quantified impact of switching to green steel
                </p>
              </div>

              <div className="flex-1 overflow-auto">
                <BusinessValuePanel deal={deal} output={output} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Stakeholder Analysis */}
        {activeTab === 'stakeholder' && (
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                  Stakeholder Readiness Analysis
                </h1>
                <p className="text-muted-foreground mt-2">
                  AI-powered prediction of stakeholder objections and readiness
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pie chart */}
                <div className="lg:col-span-1 bg-card rounded-lg border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Risk Distribution</h3>
                  {prediction ? (
                    <StakeholderPieChart prediction={prediction} />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      Run prediction to see risk distribution
                    </div>
                  )}
                </div>

                {/* Predictions */}
                <div className="lg:col-span-2 space-y-4">
                  {prediction ? (
                    <>
                      <StakeholderPredictions
                        prediction={prediction}
                        activeStakeholder={activeStakeholder}
                        onSelectStakeholder={setActiveStakeholder}
                      />
                      <button
                        onClick={handleRunPrediction}
                        disabled={predictionLoading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-2 border border-border rounded-lg font-semibold hover:bg-secondary"
                      >
                        {predictionLoading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <RefreshCw className="size-4" />
                        )}
                        Re-run Analysis
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleRunPrediction}
                      disabled={!valid || predictionLoading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
                    >
                      {predictionLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Run Stakeholder Analysis
                          <RefreshCw className="size-4" />
                        </>
                      )}
                    </button>
                  )}
                  <ModelStatusBanner prediction={prediction} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: AI Sales Brief */}
        {activeTab === 'brief' && (
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    AI Sales Brief
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Personalized conversation strategy based on predictions
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateBrief}
                    disabled={!prediction || briefLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {briefLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      'Generate'
                    )}
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary"
                  >
                    <Download className="size-4" />
                    Export
                  </button>
                </div>
              </div>

              {brief ? (
                <SalesBriefPanel result={brief} />
              ) : (
                <div className="bg-card rounded-lg border border-border p-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    Generate a brief to see personalized conversation strategy
                  </p>
                  <button
                    onClick={handleGenerateBrief}
                    disabled={!prediction}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    Generate Brief
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
