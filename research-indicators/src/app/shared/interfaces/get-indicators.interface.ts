export interface GetIndicators {
  id: string;
  name: string;
  description: string;
  numberType: string;
  numberFormat: string;
  targetUnit: string;
  targetValue: string;
  baseline: string;
  years: number[];
  code: string;
  type?: string;
  //auxiliary fields
  adding?: boolean;
}
