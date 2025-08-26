export interface GetStructures {
  structures: IndicatorsStructure[];
  agreement_id: string | number | null;
  name_level_1: string;
  name_level_2: string;
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
  representative?: IndicatorItem;
  editing?: boolean;
  newItem?: boolean;
  ghostItem?: boolean;
  itemsCount?: number;
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
  code: string;
  // aux
  adding?: boolean;
}
