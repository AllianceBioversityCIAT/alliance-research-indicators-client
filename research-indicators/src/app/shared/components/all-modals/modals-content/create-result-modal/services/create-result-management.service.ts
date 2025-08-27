import { Injectable, signal } from '@angular/core';
import { AIAssistantResult } from '../models/AIAssistantResult';

@Injectable({
  providedIn: 'root'
})
export class CreateResultManagementService {
  resultPageStep = signal<number>(0);
  expandedItem = signal<AIAssistantResult | null>(null);
  items = signal<AIAssistantResult[]>([]);
  contractId = signal<number | null>(null);
  resultTitle = signal<string | null>(null);
  year = signal<number | null>(null);
  modalTitle = signal<string>('Create A Result');

  // Step constants for better readability
  readonly STEPS = {
    CREATE_RESULT: 0,
    UPLOAD_FILE: 1,
    CREATE_OICR: 2
  } as const;

  resetModal() {
    this.resultPageStep.set(0);
    this.expandedItem.set(null);
    this.items.set([]);
    this.contractId.set(null);
    this.resultTitle.set(null);
    this.modalTitle.set('Create A Result');
  }

  setContractId(contractId: number | null) {
    this.contractId.set(contractId);
  }

  setResultTitle(title: string | null) {
    this.resultTitle.set(title);
  }

  setYear(year: number | null) {
    this.year.set(year);
  }

  setModalTitle(title: string) {
    this.modalTitle.set(title);
  }
}
