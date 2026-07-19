'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type {
  ObjectionLabel,
  PredictionResponse,
  Stakeholder,
  StakeholderPrediction,
} from '@/lib/types'
import { OBJECTION_LABELS, OBJECTION_TITLES, STAKEHOLDERS } from '@/lib/types'
import { fmtPercent } from '@/lib/value-calculator'
import { getReadinessLevel } from '@/lib/risk-level'

const READINESS_COLORS = {
  High: '#10b981',
  Medium: '#f59e0b',
  Low: '#ef4444',
}

const RISK_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
}

function ReadinessGauge({
  prediction,
}: {
  prediction: StakeholderPrediction
}) {
  // Calculate average readiness (inverse of average risk)
  const avgRisk =
    Object.values(prediction.probabilities).reduce((a, b) => a + b, 0) /
    Object.values(prediction.probabilities).length
  const readiness = Math.round((1 - avgRisk) * 100)
  const level = getReadinessLevel(readiness)

  const data = [{ value: readiness }, { value: 100 - readiness }]

  return (
    <div className="flex flex-col items-center gap-4 h-full justify-center">
      <div style={{ width: 140, height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
            >
              <Cell fill={READINESS_COLORS[level as keyof typeof READINESS_COLORS]} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-foreground">{readiness}%</div>
        <div className="text-sm text-muted-foreground">{level}</div>
        <p className="text-xs text-muted-foreground mt-2 max-w-xs">
          {level === 'High'
            ? 'Low concerns, likely to proceed'
            : level === 'Medium'
              ? 'Some concerns likely to slow down the decision'
              : 'High concerns, significant obstacles'}
        </p>
      </div>
    </div>
  )
}

function RiskBars({
  prediction,
}: {
  prediction: StakeholderPrediction
}) {
  const ordered = [...OBJECTION_LABELS]
    .sort((a, b) => prediction.probabilities[b] - prediction.probabilities[a])
    .slice(0, 5)

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm text-foreground">Top Objection Risks</h4>
      <div className="space-y-3">
        {ordered.map((label) => {
          const probability = prediction.probabilities[label]
          const risk = prediction.riskLevels[label]
          const pct = Math.round(probability * 100)
          const color = RISK_COLORS[risk]

          return (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {OBJECTION_TITLES[label]}
                </span>
                <span className="text-sm font-mono font-semibold text-foreground">
                  {pct}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function StakeholderPredictions({
  prediction,
  activeStakeholder,
  onSelectStakeholder,
}: {
  prediction: PredictionResponse
  activeStakeholder: Stakeholder
  onSelectStakeholder: (s: Stakeholder) => void
}) {
  const [internalActive, setInternalActive] = useState<Stakeholder>(
    activeStakeholder,
  )
  const active = activeStakeholder ?? internalActive

  const current =
    prediction.predictions.find((p) => p.stakeholder === active) ??
    prediction.predictions[0]

  if (!current) return null

  return (
    <div className="space-y-4">
      {/* Stakeholder selector */}
      <div className="flex gap-2 flex-wrap">
        {STAKEHOLDERS.map((stakeholder) => {
          const isActive = stakeholder === active
          return (
            <button
              key={stakeholder}
              onClick={() => {
                setInternalActive(stakeholder)
                onSelectStakeholder(stakeholder)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {stakeholder}
            </button>
          )
        })}
      </div>

      {/* Side-by-side layout: Gauge left, Risks right */}
      <div className="grid grid-cols-2 gap-6 bg-card rounded-lg border border-border p-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {active} Perspective
          </h3>
          <ReadinessGauge prediction={current} />
        </div>
        <div className="flex flex-col justify-center">
          <RiskBars prediction={current} />
        </div>
      </div>
    </div>
  )
}
