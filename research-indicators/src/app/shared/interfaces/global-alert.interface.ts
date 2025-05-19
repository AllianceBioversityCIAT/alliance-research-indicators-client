export interface GlobalAlert {
  severity: 'success' | 'info' | 'warning' | 'error' | 'secondary' | 'contrast';
  summary: string;
  detail: string;
  callbacks?: Callback[];
  placeholder?: string;
  icon?: string;
  color?: string;
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
  event?: (comment?: string) => void;
}
