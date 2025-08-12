export interface GetStructures {
  structures: IndicatorsStructure[];
}

export interface IndicatorsStructure {
  id?: string;
  name: string;
  code: string;
  items?: IndicatorItem[];
  indicators: Indicator[];
}

export interface IndicatorItem {
  id?: string;
  name: string;
  code: string;
  items?: any[];
  indicators?: Indicator[];
}

export interface Indicator {
  id: string;
  name: string;
  description: string;
  numberType: string;
  numberFormat: string;
  years: number[];
  targetUnit: string;
  targetValue: string;
  baseline: string;
  isActive: boolean;
}
