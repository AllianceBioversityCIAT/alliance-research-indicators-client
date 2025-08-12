import { Injectable, signal } from '@angular/core';
import { CurrentView } from './interfaces/set-up-project.interface';

@Injectable({
  providedIn: 'root'
})
export class SetUpProjectService {
  showAssignIndicatorModal = signal<boolean>(false);
  showIndicatorModal = signal<boolean>(false);
  showAllIndicators = signal<boolean>(false);
  currentView = signal<CurrentView>('structures');
  editingElementId = signal<string | null>(null);
}
