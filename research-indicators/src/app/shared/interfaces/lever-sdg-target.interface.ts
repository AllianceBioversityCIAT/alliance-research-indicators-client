export interface ClarisaSdg {
  id: number;
  short_name?: string;
  full_name?: string;
  icon?: string;
  color?: string;
  description?: string;
}

export interface LeverSdgTargetApi {
  id: number;
  sdg_target: string;
  sdg_target_code: string;
  clarisa_sdg?: ClarisaSdg;
}

export interface LeverSdgTargetOption extends LeverSdgTargetApi {
  sdg_target_id: number;
  select_label: string;
}

export interface ResultLeverSdgTargetPayload {
  sdg_target_id: number;
}
