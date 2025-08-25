export interface PostSyncContributor {
  contribution_id?: number | null;
  result_id: number;
  indicator_id: number;
  contribution_value: number | null;
  id?: number | string;
}
