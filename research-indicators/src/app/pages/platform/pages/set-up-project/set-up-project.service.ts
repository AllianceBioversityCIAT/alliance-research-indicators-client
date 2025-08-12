import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SetUpProjectService {
  showAssignIndicatorModal = signal<boolean>(false);
  showIndicatorModal = signal<boolean>(false);
  showAllIndicators = signal<boolean>(false);
}
