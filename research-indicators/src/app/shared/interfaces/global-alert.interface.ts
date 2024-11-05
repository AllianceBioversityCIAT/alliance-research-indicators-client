export interface GlobalAlert {
  severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';
  summary: string;
  detail: string;
  callback?: {
    onClose?: () => void;
    onConfirm?: () => void;
  };
}
