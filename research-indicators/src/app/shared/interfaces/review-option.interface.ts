export interface ReviewOption {
  key: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  message: string;
  commentLabel?: string;
  mark: boolean;
  statusId: number;
  selected: boolean;
}
