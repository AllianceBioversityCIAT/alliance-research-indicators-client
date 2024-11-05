export interface ToastMessage {
  severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';
  summary: string;
  detail: string;
}
