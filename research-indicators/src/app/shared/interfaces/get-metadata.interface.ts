import { ResultStatus } from './result-config.interface';

export interface GetMetadata {
  indicator_id?: number;
  indicator_name?: string;
  result_id?: number;
  result_official_code?: number;
  status_id?: number;
  status_name?: string;
  result_title?: string;
  created_by?: number;
  report_year?: number;
  is_principal_investigator?: boolean;
  result_contract_id?: string;
  result_status?: ResultStatus;
}
