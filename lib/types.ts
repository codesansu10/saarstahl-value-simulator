// Domain types for the Saarstahl Green-Steel Value & Objection Simulator

export type DataSource = 'Calculated' | 'Model' | 'Fallback' | 'Template';

export interface TaggedValue {
  value: number;
  source: DataSource;
  description?: string;
}

export interface DealInput {
  companyName: string;
  steelType: 'commodity' | 'special' | 'highgrade';
  annualVolume: number; // tons
  currentCost: number; // EUR per ton
  productionEmissions: number; // kg CO2 per ton
  yearsCommitment: number;
}

export interface ValueMetric {
  name: string;
  value: TaggedValue;
  unit: string;
}

export interface StakeholderPredictions {
  stakeholder: 'CFO' | 'Sustainability' | 'Operations' | 'Procurement';
  objections: string[];
  predictions: {
    costAcceptance: TaggedValue;
    emissionReduction: TaggedValue;
    paybackMonths: TaggedValue;
    riskScore: TaggedValue;
  };
}

export interface SalesBrief {
  title: string;
  executiveSummary: string;
  valueProp: string;
  keyMetrics: ValueMetric[];
  stakeholderApproaches: {
    stakeholder: string;
    pitch: string;
    counterArguments: string[];
  }[];
  closingStrategy: string;
  provenance: {
    timestamp: string;
    dataSourcesUsed: DataSource[];
    modelVersion?: string;
  };
}

export interface SavedCase {
  id: string;
  timestamp: string;
  dealInput: DealInput;
  metrics: ValueMetric[];
  predictions: StakeholderPredictions[];
  brief?: SalesBrief;
}

export interface ExportSnapshot {
  version: '1.0';
  exportDate: string;
  case: SavedCase;
  provenance: {
    allValues: Array<{
      metric: string;
      value: number;
      source: DataSource;
      description?: string;
    }>;
  };
}
