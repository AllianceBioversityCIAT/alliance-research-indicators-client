export interface ProjectSetupConfiguration {
  components: ProjectComponent[];
  subComponents: ProjectSubComponent[];
  indicators: ProjectIndicator[];
}

export interface ProjectComponent {
  id: string;
  name: string;
  code: string;
  indicators: string[]; // IDs de indicadores asignados
  isEditing?: boolean;
}

export interface ProjectSubComponent {
  id: string;
  parentComponentId: string;
  name: string;
  code: string;
  indicators: string[]; // IDs de indicadores asignados
  isEditing?: boolean;
}

export interface ProjectIndicator {
  id: string;
  name: string;
  description: string;
  level: 1 | 2; // 1 = Componentes, 2 = Sub-componentes
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
export interface NewComponentForm {
  name: string;
  code: string;
}

export interface NewSubComponentForm {
  name: string;
  code: string;
  parentComponentId: string;
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
