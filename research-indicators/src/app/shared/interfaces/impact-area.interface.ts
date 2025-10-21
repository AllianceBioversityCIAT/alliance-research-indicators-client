export interface ImpactArea {
  created_at: string;
  updated_at: string;
  is_active: boolean;
  id: number;
  name: string;
  description: string;
  financialCode: string;
  icon: string;
  color: string;
}

export interface ImpactAreaGlobalTarget {
  value: number | null;
}