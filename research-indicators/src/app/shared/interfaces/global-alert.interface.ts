export interface GlobalAlert {
  severity: 'success' | 'info' | 'warning' | 'error' | 'secondary' | 'contrast';
  summary: string;
  detail: string;
  callbacks?: callback[];
}

interface callback {
  label: string;
  event: () => void;
}
