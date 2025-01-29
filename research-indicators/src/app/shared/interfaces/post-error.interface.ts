import { HttpErrorResponse } from '@angular/common/http';

export interface PostError {
  original_error?: HttpErrorResponse | Error | undefined | null;
  message?: string;
  path?: string;
  status?: string;
  timestamp?: string;
}
