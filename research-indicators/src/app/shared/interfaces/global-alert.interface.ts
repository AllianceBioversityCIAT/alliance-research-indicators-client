export interface GlobalAlert {
  severity: 'success' | 'info' | 'warning' | 'error' | 'secondary' | 'contrast';
  summary: string;
  detail: string;
  callback?: {
    onClose?: () => void;
    onConfirm?: () => void;
  };
}
