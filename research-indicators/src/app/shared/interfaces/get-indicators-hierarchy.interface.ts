export interface GetIndicatorsHierarchy {
  id: number;
  code: string;
  name: string;
  description: string;
  numberType: string;
  numberFormat: string;
  targetUnit: string;
  targetValue: string;
  baseLine: string;
  year: number[];
  type: string;
  group_item: Groupitem;
}

interface Groupitem {
  id: number;
  name: string;
  code: string;
  parent_id: null | number;
  parent_item: Parentitem | null;
}

interface Parentitem {
  id: number;
  name: string;
  code: string;
}
