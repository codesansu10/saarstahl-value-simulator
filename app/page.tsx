'use client'

import { useCallback, useState, useMemo } from 'react'
import { Loader2, ChevronRight, Download } from 'lucide-react'
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
  }, [deal, output, features, prediction, brief])

  // Deal info header component
  const DealInfoHeader = () => (
    <div className="border-b border-border bg-card/50 px-8 py-4">
      <div className="grid grid-cols-4 gap-8 text-sm">
        <div>
          <p className="text-muted-foreground uppercase text-xs font-semibold">Company</p>
          <p className="text-foreground font-semibold">{deal.companyName}</p>
        </div>
        <div>
          <p className="text-muted-foreground uppercase text-xs font-semibold">Deal ID</p>
          <p className="text-foreground font-semibold">{deal.dealId || '—'}</p>
        </div>
        <div>
          <p className="text-muted-foreground uppercase text-xs font-semibold">Product</p>
          <p className="text-foreground font-semibold">{deal.productName}</p>
        </div>
        <div>
          <p className="text-muted-foreground uppercase text-xs font-semibold">CO₂ Saved</p>
          <p className="text-foreground font-semibold">
            {output ? `${Math.round(output.co2Saved).toLocaleString()} t` : '—'}
          </p>
        </div>
      </div>
    </div>
  )

  // Continue button component
  const ContinueButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button
      onClick={onClick}
      className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
    >
      {label}
      <ChevronRight className="size-4" />
    </button>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Side Navigation */}
      <SideNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Step 1: Calculator */}
        {activeTab === 'calculator' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <DealInfoHeader />
            <div className="flex-1 overflow-auto">
              <div className="max-w-5xl mx-auto p-8">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-foreground">
                    Business Value Calculator
                  </h1>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enter deal information to calculate the business impact of green steel
                  </p>
                </div>

                <DealInputForm deal={deal} onChange={handleDealChange} errors={errors} />

                <ContinueButton
                  onClick={() => setActiveTab('impact')}
                  label={valid ? 'Continue to Impact Dashboard' : 'Complete form to continue'}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Impact Dashboard */}
        {activeTab === 'impact' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <DealInfoHeader />
            <div className="flex-1 overflow-auto">
              <div className="p-8">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground">
                    Business Impact Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Overview of the quantified impact of switching to green steel
                  </p>
                </div>

                <BusinessValuePanel deal={deal} output={output} />

                <ContinueButton
                  onClick={() => setActiveTab('stakeholder')}
                  label="Continue to Stakeholder Analysis"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Stakeholder Analysis */}
        {activeTab === 'stakeholder' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <DealInfoHeader />
            <div className="flex-1 overflow-auto">
              <div className="p-8">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground">
                    Stakeholder Readiness Analysis
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI-powered prediction of stakeholder objections and readiness
                  </p>
                </div>

                {/* Pie chart and predictions side-by-side */}
                <div className="grid grid-cols-5 gap-6">
                  {/* Pie chart - LEFT */}
                  <div className="col-span-2 bg-card rounded-lg border border-border p-6 h-fit">
                    <h3 className="font-semibold text-foreground mb-6 text-sm">
                      Stakeholder Readiness
                    </h3>
                    {prediction ? (
                      <StakeholderPieChart prediction={prediction} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-80 text-muted-foreground text-sm">
                        <p>Run analysis to see readiness distribution</p>
                      </div>
                    )}
                  </div>

                  {/* Predictions and stakeholders - RIGHT */}
                  <div className="col-span-3 space-y-4">
                    {/* Stakeholder selector */}
                    {prediction && (
                      <div className="bg-card rounded-lg border border-border p-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">
                          Select Stakeholder
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {STAKEHOLDERS.map((stakeholder) => (
                            <button
                              key={stakeholder}
                              onClick={() => setActiveStakeholder(stakeholder)}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeStakeholder === stakeholder
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary hover:bg-secondary/80 text-foreground'
                              }`}
                            >
                              {stakeholder}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prediction details */}
                    {prediction && (
                      <StakeholderPredictions
                        prediction={prediction}
                        activeStakeholder={activeStakeholder}
                        onSelectStakeholder={setActiveStakeholder}
                      />
                    )}

                    {/* Run/Re-run button */}
                    <button
                      onClick={handleRunPrediction}
                      disabled={!valid || predictionLoading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
                    >
                      {predictionLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          {prediction ? 'Re-run' : 'Run'} Analysis
                          <ChevronRight className="size-4" />
                        </>
                      )}
                    </button>

                    <ModelStatusBanner prediction={prediction} />
                  </div>
                </div>

                <ContinueButton
                  onClick={() => setActiveTab('brief')}
                  label="Continue to AI Sales Brief"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: AI Sales Brief */}
        {activeTab === 'brief' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <DealInfoHeader />
            <div className="flex-1 overflow-auto">
              <div className="p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      AI Sales Preparation Brief
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      Personalized conversation strategy based on predictions
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleGenerateBrief}
                      disabled={!prediction || briefLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-semibold"
                    >
                      {briefLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        'Generate'
                      )}
                    </button>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary text-sm font-semibold"
                    >
                      <Download className="size-4" />
                      Export
                    </button>
                  </div>
                </div>

                {brief ? (
                  <>
                    <SalesBriefPanel result={brief} />
                    <div className="mt-8 flex gap-3">
                      <button
                        onClick={() => setActiveTab('stakeholder')}
                        className="px-6 py-3 border border-border rounded-lg hover:bg-secondary font-semibold flex items-center gap-2"
                      >
                        Back to Analysis
                      </button>
                      <button
                        onClick={handleExport}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold flex items-center gap-2"
                      >
                        <Download className="size-4" />
                        Download Brief
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-card rounded-lg border border-border p-12 text-center">
                    <p className="text-muted-foreground mb-6">
                      Generate a brief to see personalized conversation strategy
                    </p>
                    <button
                      onClick={handleGenerateBrief}
                      disabled={!prediction}
                      className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-semibold inline-flex items-center gap-2"
                    >
                      Generate Brief
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
