export interface GetContracts {
  data: Datum[];
  status: number;
  description: string;
  timestamp: string;
  path: string;
}

interface Datum {
  is_active: boolean;
  agreement_id: string;
  center_amount: string;
  center_amount_usd: string;
  client: string;
  contract_status: null | string;
  department: null | string;
  departmentId: null | string;
  description: string;
  division: null | string;
  divisionId: null | string;
  donor: null | string;
  donor_reference: null | string;
  endDateGlobal: null | string;
  endDatefinance: string;
  end_date: null | string;
  entity: null | string;
  extension_date: null | string;
  funding_type: null | string;
  grant_amount: string;
  grant_amount_usd: string;
  project: null | string;
  projectDescription: null | string;
  project_lead_description: string;
  short_title: string;
  start_date: string;
  ubwClientDescription: string;
  unit: null | string;
  unitId: null | string;
  office: null | string;
  officeId: null | string;
}
