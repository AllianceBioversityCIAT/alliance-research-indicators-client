import { GetSdgs } from './get-sdgs.interface';
import { Lever } from './oicr-creation.interface';

export interface GetAllianceAlignment {
  contracts: AllianceAlignmentContract[];
  result_sdgs: GetSdgs[];
  primary_levers: Lever[];
  contributor_levers: Lever[];
}

export interface AllianceAlignmentContract {
  is_active: boolean;
  result_contract_id: number;
  result_id: number;
  contract_id: string;
  contract_role_id: number;
  is_primary: boolean;
}
