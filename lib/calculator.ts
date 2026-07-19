import { DealInput, ValueMetric, TaggedValue } from './types';

// Green steel cost premium (typically 15-25% in market)
const PREMIUM_MULTIPLIER = 1.18;

// Environmental impact factors
const CO2_REDUCTION_RATE = 0.85; // Green steel reduces CO2 by ~85%
const CARBON_CREDIT_VALUE = 50; // EUR per ton of CO2

// Investment factors
const PRODUCTION_TECH_COST = 120000; // Fixed cost for production tech
const WORKING_CAP_MONTHS = 2;

export function calculateBusinessValue(deal: DealInput): ValueMetric[] {
  const metrics: ValueMetric[] = [];

  // Annual cost premium
  const costPremium = deal.annualVolume * deal.currentCost * (PREMIUM_MULTIPLIER - 1);
  metrics.push({
    name: 'Annual Cost Premium',
    value: { value: costPremium, source: 'Calculated', description: 'Volume × Current Cost × (Premium - 1)' },
    unit: 'EUR',
  });

  // Annual CO2 reduction
  const co2Reduction = deal.annualVolume * deal.productionEmissions * CO2_REDUCTION_RATE;
  metrics.push({
    name: 'Annual CO2 Reduction',
    value: { value: co2Reduction, source: 'Calculated', description: 'Annual Volume × Current Emissions × Reduction Rate' },
    unit: 'tons CO2',
  });

  // Carbon credit value
  const carbonCreditValue = co2Reduction * CARBON_CREDIT_VALUE;
  metrics.push({
    name: 'Carbon Credit Value (Annual)',
    value: { value: carbonCreditValue, source: 'Calculated', description: 'CO2 Reduction × EUR 50 per ton' },
    unit: 'EUR',
  });

  // Net cost over commitment period
  const netCostPremium = costPremium * deal.yearsCommitment - carbonCreditValue * deal.yearsCommitment;
  metrics.push({
    name: `Net Cost Premium (${deal.yearsCommitment} years)`,
    value: { value: Math.max(0, netCostPremium), source: 'Calculated', description: 'Annual Premium × Years - Carbon Credits' },
    unit: 'EUR',
  });

  // Total production cost
  const totalProductionCost = deal.annualVolume * deal.currentCost * PREMIUM_MULTIPLIER * deal.yearsCommitment;
  metrics.push({
    name: `Total Production Cost (${deal.yearsCommitment} years)`,
    value: { value: totalProductionCost, source: 'Calculated' },
    unit: 'EUR',
  });

  // Payback analysis
  const paybackMonths = Math.round((costPremium / (carbonCreditValue || 1)) * 12);
  metrics.push({
    name: 'Payback Period',
    value: { value: Math.max(1, paybackMonths), source: 'Calculated', description: 'Annual Premium / Annual Credits × 12 months' },
    unit: 'months',
  });

  return metrics;
}

export function calculatePaybackPeriod(deal: DealInput): TaggedValue {
  const annualCost = deal.annualVolume * deal.currentCost * (PREMIUM_MULTIPLIER - 1);
  const annualBenefit = deal.annualVolume * deal.productionEmissions * CO2_REDUCTION_RATE * CARBON_CREDIT_VALUE;

  const months = Math.round((annualCost / (annualBenefit || 1)) * 12);

  return {
    value: Math.max(1, months),
    source: 'Calculated',
    description: 'Annual Cost Premium / Annual Carbon Benefits',
  };
}

export function calculateRiskScore(deal: DealInput): TaggedValue {
  // Risk factors: volume commitment, cost premium sensitivity, emissions reduction uncertainty
  let riskScore = 30; // Base risk

  // Higher volume = lower risk (economies of scale)
  if (deal.annualVolume > 10000) riskScore -= 10;
  if (deal.annualVolume > 50000) riskScore -= 10;

  // Longer commitment = higher risk
  if (deal.yearsCommitment > 5) riskScore += 15;

  // High emissions products = lower risk (higher benefit)
  if (deal.productionEmissions > 2.5) riskScore -= 10;

  riskScore = Math.max(10, Math.min(90, riskScore));

  return {
    value: riskScore,
    source: 'Model',
    description: 'Based on volume, commitment period, and emission profile',
  };
}

export function calculateCostAcceptance(deal: DealInput): TaggedValue {
  // CFO cost acceptance likelihood (0-100)
  const costPremium = (PREMIUM_MULTIPLIER - 1) * 100;
  const payback = calculatePaybackPeriod(deal);

  let acceptance = 50; // Base

  // If payback < 18 months, high acceptance
  if (payback.value < 18) acceptance += 30;
  else if (payback.value < 36) acceptance += 15;

  // If premium < 15%, easier sell
  if (costPremium < 15) acceptance += 15;

  acceptance = Math.max(0, Math.min(100, acceptance));

  return {
    value: acceptance,
    source: 'Model',
    description: 'CFO acceptance likelihood based on payback and premium',
  };
}

export function calculateEmissionReduction(deal: DealInput): TaggedValue {
  const reduction = deal.productionEmissions * CO2_REDUCTION_RATE;
  const reductionPercent = (CO2_REDUCTION_RATE * 100).toFixed(1);

  return {
    value: reduction,
    source: 'Calculated',
    description: `${reductionPercent}% reduction in production emissions`,
  };
}
