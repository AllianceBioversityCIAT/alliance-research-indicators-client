export class TableFilters {
  levers: { id: number; name?: string; short_name?: string }[] = [];
  statusCodes: { result_status_id: number; name: string }[] = [];
  years: { id: number; name: string }[] = [];
  contracts: { agreement_id: string; display_label?: string }[] = [];
  indicators: { indicator_id: number; name: string }[] = [];
}
