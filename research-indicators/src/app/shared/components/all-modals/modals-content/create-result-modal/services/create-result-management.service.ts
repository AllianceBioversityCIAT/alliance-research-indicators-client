import { Injectable, signal } from '@angular/core';
import { AIAssistantResult } from '../models/AIAssistantResult';

@Injectable({
  providedIn: 'root'
})
export class CreateResultManagementService {
  resultPageStep = signal<number>(0);
  expandedItem = signal<AIAssistantResult | null>(null);
  items = signal<AIAssistantResult[]>([]);
}
