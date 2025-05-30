import { Result } from '../../../../shared/interfaces/result/result.interface';

export interface TableColumn {
  field: string;
  path: string;
  header: string;
  minWidth?: string;
  getValue?: (result: Result) => string;
  filter?: boolean;
  hideIf?: () => boolean;
  hideFilterIf?: () => boolean;
}
