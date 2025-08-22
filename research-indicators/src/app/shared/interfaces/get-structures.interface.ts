export interface GetStructures {
  structures: IndicatorsStructure[];
  agreement_id: string | number | null;
}

export interface IndicatorsStructure {
  id?: string;
  name: string;
  code: string;
  items?: IndicatorItem[];
  indicators: Indicator[];
  //auxiliary attributes
  editing?: boolean;
  newStructure?: boolean;
}

export interface IndicatorItem {
  id?: string;
  name: string;
  code: string;
  indicators?: Indicator[];
  //auxiliary fields
  representative?: any;
  editing?: boolean;
  newItem?: boolean;
  ghostItem?: boolean;
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
  // aux
  adding?: boolean;
}
