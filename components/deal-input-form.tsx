'use client'

import { useState } from 'react'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import {
  CERTIFICATION_STATUSES,
  DELIVERY_TIMELINES,
  INDUSTRIES,
  MATERIAL_TYPES,
  PROOF_ITEMS,
  STAKEHOLDERS,
  SUPPLY_RELIABILITY,
  TECHNICAL_QUALIFICATION_STATUSES,
  type DealInput,
  type ProofItem,
} from '@/lib/types'
import {
  PROFILE_FEATURE_LABELS,
  STAKEHOLDER_PROFILES,
  type StakeholderProfile,
} from '@/lib/stakeholder-profiles'
import type { ValidationErrors } from '@/lib/validation'

type NumericField =
  | 'annualSteelVolumeTonnes'
  | 'conventionalSteelPricePerTonne'
  | 'greenPremiumPerTonne'
  | 'baselineCo2Intensity'
  | 'greenSteelCo2Intensity'
  | 'productUnits'
  | 'proofItemsAvailable'
  | 'proofItemsRequired'
  | 'carbonValue'

function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode
  htmlFor: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-xs font-medium text-steel-grey-dark"
    >
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground tabular-nums outline-none focus:border-[var(--brand-green)] focus:ring-2 focus:ring-[var(--brand-green)]/25'

function Fieldset({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-border bg-surface-subtle p-4">
      <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

export function DealInputForm({
  deal,
  onChange,
  errors,
}: {
  deal: DealInput
  onChange: (patch: Partial<DealInput>) => void
  errors: ValidationErrors
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const errFor = (field: keyof ValidationErrors) => errors[field]

  const num = (field: NumericField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    onChange({ [field]: v === '' ? 0 : Number(v) } as Partial<DealInput>)
  }

  const toggleProof = (item: ProofItem) => {
    const has = deal.proofStatus.includes(item)
    onChange({
      proofStatus: has
        ? deal.proofStatus.filter((p) => p !== item)
        : [...deal.proofStatus, item],
    })
  }

  return (
    <div className="space-y-6">
      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          {/* Customer & Deal Information */}
          <Fieldset title="Customer & Deal Information">
            <div className="space-y-3">
              <div>
                <Label htmlFor="companyName">Company</Label>
                <input
                  id="companyName"
                  className={inputCls}
                  value={deal.companyName}
                  onChange={(e) => onChange({ companyName: e.target.value })}
                  aria-invalid={!!errFor('companyName')}
                />
                {errFor('companyName') ? (
                  <p className="mt-1 text-xs text-[var(--risk-high)]">
                    {errFor('companyName')}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="industry">Industry</Label>
                <select
                  id="industry"
                  className={inputCls}
                  value={deal.industry}
                  onChange={(e) =>
                    onChange({ industry: e.target.value as DealInput['industry'] })
                  }
                >
                  {INDUSTRIES.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="materialType">Material Type</Label>
                <select
                  id="materialType"
                  className={inputCls}
                  value={deal.materialType}
                  onChange={(e) =>
                    onChange({
                      materialType: e.target.value as DealInput['materialType'],
                    })
                  }
                >
                  {MATERIAL_TYPES.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="productName">Product / Application</Label>
                <input
                  id="productName"
                  className={inputCls}
                  value={deal.productName}
                  onChange={(e) => onChange({ productName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="dealId">Deal ID (optional)</Label>
                <input
                  id="dealId"
                  className={inputCls}
                  value={deal.dealId}
                  onChange={(e) => onChange({ dealId: e.target.value })}
                />
              </div>
            </div>
          </Fieldset>

          {/* Proof & Supply Information */}
          <Fieldset title="Proof & Supply Information">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pcfAvailable">PCF Available</Label>
                  <select
                    id="pcfAvailable"
                    className={inputCls}
                    value={deal.proofItemsAvailable > 0 ? 'Yes' : 'No'}
                    onChange={(e) =>
                      onChange({
                        proofItemsAvailable: e.target.value === 'Yes' ? 1 : 0,
                      })
                    }
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="certificationStatus">Certification Status</Label>
                  <select
                    id="certificationStatus"
                    className={inputCls}
                    value={deal.certificationStatus}
                    onChange={(e) =>
                      onChange({
                        certificationStatus: e.target
                          .value as DealInput['certificationStatus'],
                      })
                    }
                  >
                    {CERTIFICATION_STATUSES.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="supplyReliability">Supply Reliability</Label>
                <select
                  id="supplyReliability"
                  className={inputCls}
                  value={deal.supplyReliability}
                  onChange={(e) =>
                    onChange({
                      supplyReliability: e.target
                        .value as DealInput['supplyReliability'],
                    })
                  }
                >
                  {SUPPLY_RELIABILITY.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="proofItemsAvailable">Proof Items Available</Label>
                  <input
                    id="proofItemsAvailable"
                    type="number"
                    className={inputCls}
                    value={deal.proofItemsAvailable || ''}
                    onChange={num('proofItemsAvailable')}
                  />
                </div>
                <div>
                  <Label htmlFor="proofItemsRequired">Proof Items Required</Label>
                  <input
                    id="proofItemsRequired"
                    type="number"
                    className={inputCls}
                    value={deal.proofItemsRequired || ''}
                    onChange={num('proofItemsRequired')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="salespersonNotes">Salesperson Notes</Label>
                <textarea
                  id="salespersonNotes"
                  rows={2}
                  className={`${inputCls} resize-y`}
                  value={deal.salespersonNotes}
                  onChange={(e) => onChange({ salespersonNotes: e.target.value })}
                />
              </div>
            </div>
          </Fieldset>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* Deal Inputs */}
          <Fieldset title="Deal Inputs">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="annualSteelVolumeTonnes">Annual Steel Volume</Label>
                  <input
                    id="annualSteelVolumeTonnes"
                    type="number"
                    className={inputCls}
                    value={deal.annualSteelVolumeTonnes || ''}
                    onChange={num('annualSteelVolumeTonnes')}
                    aria-invalid={!!errFor('annualSteelVolumeTonnes')}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">t</p>
                </div>
                <div>
                  <Label htmlFor="conventionalSteelPricePerTonne">
                    Conventional Steel Price
                  </Label>
                  <input
                    id="conventionalSteelPricePerTonne"
                    type="number"
                    className={inputCls}
                    value={deal.conventionalSteelPricePerTonne || ''}
                    onChange={num('conventionalSteelPricePerTonne')}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">€/t</p>
                </div>
                <div>
                  <Label htmlFor="greenPremiumPerTonne">Green Steel Premium</Label>
                  <input
                    id="greenPremiumPerTonne"
                    type="number"
                    className={inputCls}
                    value={deal.greenPremiumPerTonne || ''}
                    onChange={num('greenPremiumPerTonne')}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">€/t</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="baselineCo2Intensity">Baseline CO2 Intensity</Label>
                  <input
                    id="baselineCo2Intensity"
                    type="number"
                    step="0.001"
                    className={inputCls}
                    value={deal.baselineCo2Intensity || ''}
                    onChange={num('baselineCo2Intensity')}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">tCO₂/t</p>
                </div>
                <div>
                  <Label htmlFor="greenSteelCo2Intensity">Green Steel CO2 Intensity</Label>
                  <input
                    id="greenSteelCo2Intensity"
                    type="number"
                    step="0.001"
                    className={inputCls}
                    value={deal.greenSteelCo2Intensity || ''}
                    onChange={num('greenSteelCo2Intensity')}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">tCO₂/t</p>
                  {errFor('greenSteelCo2Intensity') ? (
                    <p className="mt-1 text-xs text-[var(--risk-medium)]">
                      {errFor('greenSteelCo2Intensity')}
                    </p>
                  ) : null}
                </div>
                <div>
                  <Label htmlFor="productUnits">Product Units (per year)</Label>
                  <input
                    id="productUnits"
                    type="number"
                    className={inputCls}
                    value={deal.productUnits || ''}
                    onChange={num('productUnits')}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">units</p>
                </div>
              </div>
            </div>
          </Fieldset>

          {/* Carbon Price Assumption */}
          <Fieldset title="Carbon Price Assumption">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="carbonValue">Carbon Price Value</Label>
                  <input
                    id="carbonValue"
                    type="number"
                    className={inputCls}
                    value={deal.carbonPrice.value || ''}
                    onChange={(e) =>
                      onChange({
                        carbonPrice: {
                          ...deal.carbonPrice,
                          value: e.target.value === '' ? 0 : Number(e.target.value),
                        },
                      })
                    }
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">€/t</p>
                </div>
                <div>
                  <Label htmlFor="carbonCurrency">Source / Assumption</Label>
                  <input
                    id="carbonCurrency"
                    className={inputCls}
                    value={deal.carbonPrice.source}
                    onChange={(e) =>
                      onChange({
                        carbonPrice: {
                          ...deal.carbonPrice,
                          source: e.target.value,
                        },
                      })
                    }
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {deal.carbonPrice.source || 'Illustrative EU ETS assumption'}
                  </p>
                </div>
              </div>
            </div>
          </Fieldset>
        </div>
      </div>

      {/* Advanced assumptions: stakeholder profiles - Full width */}
      <div className="rounded-lg border border-border bg-surface-subtle">
        <button
          type="button"
          onClick={() => setShowAdvanced((s) => !s)}
          aria-expanded={showAdvanced}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-steel-grey-dark"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="size-4" aria-hidden />
            Advanced assumptions — stakeholder profiles
          </span>
          <ChevronDown
            className={`size-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
        {showAdvanced ? (
          <div className="overflow-x-auto border-t border-border px-4 py-3">
            <p className="mb-2 text-xs text-muted-foreground">
              Read-only priority weights (0–1). These differentiate objection
              probabilities per stakeholder for the same deal.
            </p>
            <table className="w-full text-xs tabular-nums">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-1 pr-2 font-medium">Feature</th>
                  {STAKEHOLDERS.map((s) => (
                    <th key={s} className="px-2 py-1 font-medium">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  Object.keys(PROFILE_FEATURE_LABELS) as (keyof StakeholderProfile)[]
                ).map((feat) => (
                  <tr key={feat} className="border-t border-border/60">
                    <td className="py-1 pr-2 text-steel-grey-dark">
                      {PROFILE_FEATURE_LABELS[feat]}
                    </td>
                    {STAKEHOLDERS.map((s) => (
                      <td key={s} className="px-2 py-1">
                        {STAKEHOLDER_PROFILES[s][feat].toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  )
}
