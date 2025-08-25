export interface PostIndicator {
  name: string;
  description: string;
  numberType: string;
  numberFormat: string;
  years: number[];
  targetUnit: string;
  targetValue: number;
  baseline: number;
  agreement_id: number;
  code: string;
  indicatorType?: string;
  id?: number | string | null;
}
