import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class YesOrNotService {
  list = signal<{ name: string; value: number }[]>([
    { name: 'Yes', value: 0 },
    { name: 'No', value: 1 }
  ]);
  loading = signal(false);
}
