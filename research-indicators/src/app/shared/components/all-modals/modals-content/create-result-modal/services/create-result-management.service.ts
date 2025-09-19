import { Injectable, WritableSignal, signal } from '@angular/core';
import { AIAssistantResult } from '../models/AIAssistantResult';
import { Lever, OicrCreation } from '../../../../../interfaces/oicr-creation.interface';

@Injectable({
  providedIn: 'root'
})
export class CreateResultManagementService {
  resultPageStep = signal<number>(0);
  expandedItem = signal<AIAssistantResult | null>(null);
  items = signal<AIAssistantResult[]>([]);
  contractId = signal<string | null>(null);
  presetFromProjectResultsTable = signal<boolean>(false);
  resultTitle = signal<string | null>(null);
  year = signal<number | null>(null);
  modalTitle = signal<string>('Create A Result');
  currentRequestedResultCode = signal<number | null>(null);
  editingOicr = signal<boolean>(false);
  oicrPrimaryOptionsDisabled: WritableSignal<Lever[]> = signal([]);
  editingOicr = signal<boolean>(false);
  createOicrBody: WritableSignal<OicrCreation> = signal({
    step_one: {
      main_contact_person: {
        result_user_id: 0,
        result_id: 0,
        user_id: 0,
        user_role_id: 0
      },
      tagging: {
        tag_id: 0
      },
      link_result: {
        external_oicr_id: 0
      },
      outcome_impact_statement: ''
    },
    step_two: {
      primary_lever: [],
      contributor_lever: []
    },
    step_three: {
      geo_scope_id: undefined,
      countries: [],
      regions: [],
      comment_geo_scope: ''
    },
    step_four: {
      general_comment: ''
    },
    base_information: {
      indicator_id: 5,
      contract_id: String(this.contractId() || ''),
      title: this.resultTitle() || '',
      description: '',
      year: String(this.year() || ''),
      is_ai: false
    }
  });

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
    this.presetFromProjectResultsTable.set(false);
    this.resultTitle.set(null);
    this.modalTitle.set('Create A Result');
  }

  setContractId(contractId: string | null) {
    this.contractId.set(contractId);
  }

  setPresetFromProjectResultsTable(value: boolean) {
    this.presetFromProjectResultsTable.set(value);
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
