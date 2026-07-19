'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, RefreshCw, Download, ArrowRight } from 'lucide-react'
import type {
  DealInput,
  PredictionResponse,
  Stakeholder,
  Provenance,
} from '@/lib/types'
import { createMercedesExample, createEmptyDeal } from '@/lib/defaults'
import { calculateBusinessValue } from '@/lib/value-calculator'
import { validateDeal, isDealValid } from '@/lib/validation'
import { buildFeatureRows } from '@/lib/feature-engineering'
import { fetchPrediction, fetchBrief } from '@/lib/api-client'
import {
  loadCases,
  saveCase,
  deleteCase,
  type SavedCase,
} from '@/lib/storage'
import { buildCaseExport, downloadJson, slugify } from '@/lib/export'
import type { BriefResult } from '@/lib/brief-schema'

import { AppHeader } from '@/components/app-header'
import { WorkflowStepper, type WorkflowStep } from '@/components/workflow-stepper'
import { DealInputForm } from '@/components/deal-input-form'
import { BusinessValuePanel } from '@/components/business-value-panel'
import { ModelStatusBanner } from '@/components/model-status-banner'
import { StakeholderPredictions } from '@/components/stakeholder-predictions'
import { SalesBriefPanel } from '@/components/sales-brief-panel'

// Step 1: Deal Input Page
function Step1Page({
  deal,
  onChange,
  errors,
  valid,
  onNext,
}: {
  deal: DealInput
  onChange: (patch: Partial<DealInput>) => void
  errors: Record<string, string>
  valid: boolean
  onNext: () => void
}) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppHeader />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-steel-grey-dark">
              Business Value Calculator
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter deal details to calculate the business impact of green steel
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <DealInputForm deal={deal} onChange={onChange} errors={errors} />
          </div>

          <div className="flex gap-3 justify-center pt-4">
            <button
              type="button"
              onClick={() => {
                onChange({})
                setDeal(createEmptyDeal())
              }}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--brand-green)]/50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!valid}
              className="flex items-center gap-2 rounded-lg bg-[var(--brand-green)] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-green-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calculate Business Value
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 2: Business Impact Dashboard
function Step2Page({
  deal,
  output,
  onEdit,
  onNext,
}: {
  deal: DealInput
  output: ReturnType<typeof calculateBusinessValue>
  onEdit: () => void
  onNext: () => void
}) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppHeader />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Top bar with deal context */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-steel-grey-dark">
                Business Impact Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Overview of the quantified impact of switching to green steel
              </p>
            </div>
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--brand-green)]/50"
            >
              ✎ Edit Inputs
            </button>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* CO2 Saved */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  CO₂ Saved
                </span>
                <span className="text-lg font-bold text-[var(--brand-green)]">
                  ✓
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {Math.round(output.co2Saved).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">t CO₂ / year</p>
            </div>

            {/* Premium per Product */}
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs font-medium text-muted-foreground block mb-2">
                Premium per Product
              </span>
              <p className="text-2xl font-bold text-foreground">
                €{Math.round(output.premiumPerProduct)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">per unit</p>
            </div>

            {/* Total Premium */}
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs font-medium text-muted-foreground block mb-2">
                Total Premium
              </span>
              <p className="text-2xl font-bold text-foreground">
                €{Math.round(output.totalPremium / 1_000_000)}.{Math.round((output.totalPremium % 1_000_000) / 100_000)} M
              </p>
              <p className="text-xs text-muted-foreground mt-1">per year</p>
            </div>

            {/* Product Price Impact */}
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs font-medium text-muted-foreground block mb-2">
                Product Price Impact
              </span>
              <p className="text-2xl font-bold text-foreground">
                +{(output.premiumPercentage * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">vs. conventional</p>
            </div>
          </div>

          {/* Secondary Metrics + Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs font-medium text-muted-foreground block mb-2">
                Material-Level Premium
              </span>
              <p className="text-lg font-bold text-foreground">
                {output.premiumPercentage.toFixed(1)}%
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs font-medium text-muted-foreground block mb-2">
                Proof Score
              </span>
              <p className="text-lg font-bold text-foreground">
                {Math.round(output.proofScore * 100)}%
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs font-medium text-muted-foreground block mb-2">
                Supply Reliability
              </span>
              <p className="text-lg font-bold text-foreground">
                Medium
              </p>
            </div>
          </div>

          {/* Business Summary */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold text-foreground mb-2">Business Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Choosing green steel for this deal increases the final vehicle cost by only €
              {Math.round(output.premiumPerProduct)} per vehicle (
              {(output.premiumPercentage * 100).toFixed(2)}%) while reducing embedded emissions by almost{' '}
              {Math.round(output.co2Saved).toLocaleString()} t CO₂ per year.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onNext}
              className="flex items-center gap-2 rounded-lg bg-[var(--brand-green)] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-green-dark)]"
            >
              View Stakeholder Analysis
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 3: Stakeholder Analysis
function Step3Page({
  prediction,
  predLoading,
  predError,
  onRunPrediction,
  activeStakeholder,
  onSelectStakeholder,
  onBack,
  onNext,
  valid,
}: {
  prediction: PredictionResponse | null
  predLoading: boolean
  predError: string | null
  onRunPrediction: () => void
  activeStakeholder: Stakeholder
  onSelectStakeholder: (s: Stakeholder) => void
  onBack: () => void
  onNext: () => void
  valid: boolean
}) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppHeader />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-steel-grey-dark">
                Stakeholder Readiness Analysis
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Select a stakeholder to see their likely objections and readiness
              </p>
            </div>
            <button
              type="button"
              onClick={onRunPrediction}
              disabled={predLoading || !valid}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--brand-green)]/50 disabled:opacity-50"
            >
              {predLoading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-4" aria-hidden />
              )}
              Re-run Model
            </button>
          </div>

          {predError && (
            <div className="rounded-lg border border-[var(--risk-high)]/30 bg-[var(--risk-high-soft)] p-3 text-sm text-[var(--risk-high)]">
              {predError}
            </div>
          )}

          {predLoading && !prediction && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <Loader2 className="size-5 animate-spin text-[var(--brand-green)]" aria-hidden />
              <span className="text-sm text-muted-foreground">
                Scoring objections across stakeholders…
              </span>
            </div>
          )}

          {prediction && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <ModelStatusBanner prediction={prediction} />
            </div>
          )}

          {prediction && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <StakeholderPredictions
                prediction={prediction}
                activeStakeholder={activeStakeholder}
                onSelectStakeholder={onSelectStakeholder}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--brand-green)]/50"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!prediction}
              className="flex items-center gap-2 rounded-lg bg-[var(--brand-green)] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-green-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate AI Brief
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 4: AI Sales Brief
function Step4Page({
  brief,
  briefLoading,
  briefError,
  activeStakeholder,
  onRunBrief,
  prediction,
  onBack,
}: {
  brief: BriefResult | null
  briefLoading: boolean
  briefError: string | null
  activeStakeholder: Stakeholder
  onRunBrief: (s: Stakeholder) => void
  prediction: PredictionResponse | null
  onBack: () => void
}) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppHeader />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-steel-grey-dark">
                AI Sales Preparation Brief
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Intelligent talking points and next steps for your conversation
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const element = document.createElement('a')
                element.setAttribute(
                  'href',
                  'data:text/html;charset=utf-8,' +
                    encodeURIComponent(
                      document.documentElement.outerHTML,
                    ),
                )
                element.setAttribute('download', 'brief.html')
                element.style.display = 'none'
                document.body.appendChild(element)
                element.click()
                document.body.removeChild(element)
              }}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--brand-green)]/50"
            >
              <Download className="size-4" aria-hidden />
              Export PDF
            </button>
          </div>

          {briefError && (
            <div className="rounded-lg border border-[var(--risk-high)]/30 bg-[var(--risk-high-soft)] p-3 text-sm text-[var(--risk-high)]">
              {briefError}
            </div>
          )}

          {briefLoading && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <Loader2 className="size-5 animate-spin text-[var(--brand-green)]" aria-hidden />
              <span className="text-sm text-muted-foreground">
                Generating AI brief…
              </span>
            </div>
          )}

          {brief && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <SalesBriefPanel
                brief={brief}
                activeStakeholder={activeStakeholder}
                onRegenerate={() => onRunBrief(activeStakeholder)}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--brand-green)]/50"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const [deal, setDeal] = useState<DealInput>(() => createMercedesExample())
  const [step, setStep] = useState(1)

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const [predLoading, setPredLoading] = useState(false)
  const [predError, setPredError] = useState<string | null>(null)

  const [activeStakeholder, setActiveStakeholder] =
    useState<Stakeholder>('Procurement')

  const [brief, setBrief] = useState<BriefResult | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const [briefError, setBriefError] = useState<string | null>(null)

  const errors = useMemo(() => validateDeal(deal), [deal])
  const valid = useMemo(() => isDealValid(deal), [deal])
  const output = useMemo(
    () => (valid ? calculateBusinessValue(deal) : null),
    [deal, valid],
  )

  const onChange = useCallback((patch: Partial<DealInput>) => {
    setDeal((d) => ({ ...d, ...patch }))
    setPrediction(null)
    setBrief(null)
    setPredError(null)
  }, [])

  const runPrediction = useCallback(async () => {
    if (!output) return
    setPredLoading(true)
    setPredError(null)
    try {
      const res = await fetchPrediction(deal, output)
      setPrediction(res)
    } catch (e) {
      setPredError(e instanceof Error ? e.message : 'Prediction failed')
    } finally {
      setPredLoading(false)
    }
  }, [deal, output])

  const runBrief = useCallback(
    async (stakeholder: Stakeholder) => {
      if (!prediction || !output) return
      setActiveStakeholder(stakeholder)
      setBriefLoading(true)
      setBriefError(null)
      try {
        const res = await fetchBrief(deal, output, stakeholder, prediction)
        setBrief(res)
      } catch (e) {
        setBriefError(e instanceof Error ? e.message : 'Brief generation failed')
      } finally {
        setBriefLoading(false)
      }
    },
    [deal, output, prediction],
  )

  // Render the appropriate step
  if (step === 1) {
    return (
      <Step1Page
        deal={deal}
        onChange={onChange}
        errors={errors}
        valid={valid}
        onNext={() => setStep(2)}
      />
    )
  }

  if (step === 2) {
    return (
      <Step2Page
        deal={deal}
        output={output!}
        onEdit={() => setStep(1)}
        onNext={() => {
          void runPrediction()
          setStep(3)
        }}
      />
    )
  }

  if (step === 3) {
    return (
      <Step3Page
        prediction={prediction}
        predLoading={predLoading}
        predError={predError}
        onRunPrediction={runPrediction}
        activeStakeholder={activeStakeholder}
        onSelectStakeholder={setActiveStakeholder}
        onBack={() => setStep(2)}
        onNext={() => {
          if (prediction) {
            void runBrief(activeStakeholder)
            setStep(4)
          }
        }}
        valid={valid}
      />
    )
  }

  if (step === 4) {
    return (
      <Step4Page
        brief={brief}
        briefLoading={briefLoading}
        briefError={briefError}
        activeStakeholder={activeStakeholder}
        onRunBrief={runBrief}
        prediction={prediction}
        onBack={() => setStep(3)}
      />
    )
  }

  return null
}
