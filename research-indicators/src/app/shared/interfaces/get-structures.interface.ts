export interface GetStructures {
  structures: IndicatorsStructure[];
  agreement_id: string | number | null;
  levels: Level[];
}

export interface Level {
  name_level_1?: string;
  custom_fields: CustomField[];
  name_level_2?: string;
}

export interface CustomField {
  fieldID: number;
  field_name: string;
}

export interface IndicatorsStructure {
  id?: string | null;
  name: string;
  code: string;
  items?: IndicatorItem[];
  indicators: Indicator[];
  //auxiliary attributes
  editing?: boolean;
  newStructure?: boolean;
  custom_values: levelCustomFieldValue[];
}

export interface levelCustomFieldValue {
  field: number;
  field_value: string;
}

export interface IndicatorItem {
  id?: string | null;
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
