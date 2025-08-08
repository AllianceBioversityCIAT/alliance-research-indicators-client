export interface ProjectSetupConfiguration {
  structures: ProjectStructure[];
}

export interface ProjectStructure {
  id: string;
  name: string;
  code: string;
  items: ProjectItem[];
  indicators: ProjectIndicator[];
  isEditing?: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
  code: string;
  indicators: ProjectIndicator[];
  isEditing?: boolean;
}

export interface ProjectIndicator {
  id: string;
  name: string;
  description: string;
  level: 1 | 2; // 1 = Structures, 2 = Items
  numberType: NumberTypeOption;
  numberFormat: NumberFormatOption;
  years: number[];
  targetUnit: string;
  targetValue: number | null;
  baseline: number | null;
  isActive: boolean;
}

export type NumberTypeOption = 'sum' | 'average' | 'count' | 'yes/no';
export type NumberFormatOption = 'number' | 'decimal';

export const NUMBER_TYPE_OPTIONS: { label: string; value: NumberTypeOption }[] = [
  { label: 'Sum', value: 'sum' },
  { label: 'Average', value: 'average' },
  { label: 'Count', value: 'count' },
  { label: 'Yes/No', value: 'yes/no' }
];

export const NUMBER_FORMAT_OPTIONS: { label: string; value: NumberFormatOption }[] = [
  { label: 'Number', value: 'number' },
  { label: 'Decimal', value: 'decimal' }
];

export const AVAILABLE_YEARS: number[] = [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

// Interfaces para nuevos formularios
export interface NewStructureForm {
  name: string;
  code: string;
}

export interface NewItemForm {
  name: string;
  code: string;
  parentStructureId: string;
}

export interface NewIndicatorForm {
  name: string;
  description: string;
  level: 1 | 2;
  numberType: NumberTypeOption;
  numberFormat: NumberFormatOption;
  years: number[];
  targetUnit: string;
  targetValue: number | null;
  baseline: number | null;
}
