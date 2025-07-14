import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class YesOrNotSecondaryService {
  list = signal<{ name: string; value: number }[]>([
    { name: 'Yes', value: 1 },
    { name: 'Yes, with adaptations', value: 2 },
    { name: 'No', value: 0 }
  ]);
  loading = signal(false);
}
