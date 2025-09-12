export interface GetStructures {
  structures: IndicatorsStructure[];
  agreement_id: string | number | null;
  levels: Level[];
}

export interface Level {
  custom_fields: CustomField[];
  name?: string;
}

export interface CustomField {
  fieldID: number | null;
  field_name: string;
}

export interface IndicatorsStructure {
  id?: string | null;
  name: string;
  code: string;
  items?: IndicatorItem[];
  indicators: Indicator[];
  custom_values: levelCustomFieldValue[];
  //auxiliary attributes
  newStructure?: boolean;
  level_id?: number;
  parent_id?: number | null | string;
}

export interface levelCustomFieldValue {
  field: number;
  field_value: string;
  // auxiliary fields
  field_name: string;
}

export interface IndicatorItem {
  id?: string | null;
  name: string;
  code: string;
  indicators?: Indicator[];
  custom_values: levelCustomFieldValue[];
  //auxiliary fields
  representative?: IndicatorItem;
  newItem?: boolean;
  ghostItem?: boolean;
  itemsCount?: number;
  parent_id?: number | null | string;
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
