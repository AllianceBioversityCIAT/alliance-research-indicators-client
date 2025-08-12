export interface GetStructures {
  structures: IndicatorsStructure[];
}

export interface IndicatorsStructure {
  id: string;
  name: string;
  code: string;
  items: Item[];
  indicators: Indicator[];
}

interface Item {
  id: string;
  name: string;
  code: string;
  items: any[];
  indicators: Indicator[];
}

interface Indicator {
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
