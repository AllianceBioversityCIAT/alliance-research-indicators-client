export interface LeverSdgTargetApi {
  id: number;
  sdg_target: string;
  sdg_target_code: string;
}

export interface LeverSdgTargetOption extends LeverSdgTargetApi {
  sdg_target_id: number;
  select_label: string;
}

export interface ResultLeverSdgTargetPayload {
  sdg_target_id: number;
}
