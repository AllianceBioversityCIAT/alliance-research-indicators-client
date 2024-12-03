import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class YesOrNotService {
  list = signal<any[]>([
    { name: 'Yes', value: 0 },
    { name: 'No', value: 1 }
  ]);
  loading = signal(false);
}
