export interface GetAllianceAlignment {
  contracts: Contract[];
  levers: Lever[];
}

interface Lever {
  is_active: boolean;
  result_lever_id: number;
  result_id: number;
  lever_id: number;
  lever_role_id: number;
  is_primary: boolean;
}

interface Contract {
  is_active: boolean;
  result_contract_id: number;
  result_id: number;
  contract_id: string;
  contract_role_id: number;
  is_primary: boolean;
}
