import { GetSdgs } from './get-sdgs.interface';

export interface GetAllianceAlignment {
  contracts: Contract[];
  result_sdgs: GetSdgs[];
}

interface Contract {
  is_active: boolean;
  result_contract_id: number;
  result_id: number;
  contract_id: string;
  contract_role_id: number;
  is_primary: boolean;
}
