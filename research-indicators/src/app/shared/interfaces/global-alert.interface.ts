export interface GlobalAlert {
  severity: 'success' | 'info' | 'warning' | 'error' | 'secondary' | 'contrast';
  summary: string;
  detail: string;
  callbacks?: Callback[];
  icon?: string;
  color?: string;
  confirmCallback?: Callback;
  cancelCallback?: Callback;
}

interface Callback {
  label: string;
  event?: () => void;
}
