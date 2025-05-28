export interface GlobalAlert {
  severity: 'success' | 'confirm' | 'info' | 'warning' | 'error' | 'secondary' | 'contrast';
  summary: string;
  detail: string;
  callbacks?: Callback[];
  placeholder?: string;
  icon?: string;
  color?: string;
  selectorLabel?: string;
  selectorRequired?: boolean;
  commentLabel?: string;
  commentRequired?: boolean;
  confirmCallback?: Callback;
  cancelCallback?: Callback;
  hasNoButton?: boolean;
  hasNoCancelButton?: boolean;
  generalButton?: boolean;
  buttonColor?: string;
}

interface Callback {
  label: string;
  event?: (data?: { comment?: string; selected?: string }) => void;
}
