import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CreateResultManagementService } from '../../services/create-result-management.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ToPromiseService } from '../../../../../../services/to-promise.service';
import { ActionsService } from '../../../../../../services/actions.service';
import { AIAssistantResult } from '../../models/AIAssistantResult';
import { ResultAiItemComponent } from './components/result-ai-item/result-ai-item.component';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { FileManagerService } from '@shared/services/file-manager.service';
import { TextMiningService } from '@shared/services/text-mining.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { SelectModule } from 'primeng/select';
import { GetContractsService } from '@shared/services/control-list/get-contracts.service';
import { FormsModule } from '@angular/forms';
import { GetContracts } from '@shared/interfaces/get-contracts.interface';

@Component({
  selector: 'app-result-ai-assistant',
  imports: [CommonModule, ButtonModule, PaginatorModule, SelectModule, FormsModule, ResultAiItemComponent],
  templateUrl: './result-ai-assistant.component.html',
  styleUrl: './result-ai-assistant.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultAiAssistantComponent {
  acceptedFormats: string[] = ['.pdf', '.docx', '.txt'];
  maxSizeMB = 10;
  isDragging = false;
  selectedFile: File | null = null;
  analyzingDocument = signal(false);
  documentAnalyzed = signal(false);
  first = signal(0);
  rows = signal(5);
  expandedItem = signal<AIAssistantResult | null>(null);
  getContractsService = inject(GetContractsService);
  filteredPrimaryContracts = signal<GetContracts[]>([]);

  TP = inject(ToPromiseService);
  actions = inject(ActionsService);
  createResultManagementService = inject(CreateResultManagementService);
  allModalsService = inject(AllModalsService);
  fileManagerService = inject(FileManagerService);
  textMiningService = inject(TextMiningService);
  cache = inject(CacheService);

  activeIndex = signal(0);

  steps = signal([
    { label: 'Uploading document', completed: false, inProgress: false, progress: 0 },
    { label: 'Reading content', completed: false, inProgress: false, progress: 0 },
    { label: 'Analyzing text', completed: false, inProgress: false, progress: 0 },
    { label: 'Finding relevant content', completed: false, inProgress: false, progress: 0 },
    { label: 'Generating response', completed: false, inProgress: false, progress: 0 }
  ]);

  body = signal<{ contract_id: number | null }>({
    contract_id: null
  });

  isInvalid = computed(() => {
    return !this.body().contract_id;
  });

  constructor() {
    this.allModalsService.setGoBackFunction(() => this.goBack());
  }

  goBack() {
    if (this.analyzingDocument()) return;

    if (this.documentAnalyzed()) {
      this.selectedFile = null;
      this.createResultManagementService.items.set([]);
      this.documentAnalyzed.set(false);
      this.analyzingDocument.set(false);
      return;
    }

    this.createResultManagementService.resultPageStep.set(0);
  }

  onPageChange(event: PaginatorState) {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 5);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File) {
    if (this.isValidFileType(file) && this.isValidFileSize(file)) {
      this.fileSelected(file);
    } else {
      this.actions.showGlobalAlert({
        severity: 'error',
        hasNoButton: true,
        summary: 'FILE SIZE EXCEEDED',
        detail: `The uploaded document exceeds the ${this.maxSizeMB} MB limit. Please select a smaller file to continue. `
      });
    }
  }

  isValidFileType(file: File): boolean {
    return this.acceptedFormats.some(format => file.name.toLowerCase().endsWith(format));
  }

  isValidFileSize(file: File): boolean {
    return file.size <= this.maxSizeMB * 1024 * 1024;
  }

  fileSelected(file: File) {
    this.selectedFile = file;
  }

  goBackToCreateResult() {
    this.createResultManagementService.resetModal();
    this.selectedFile = null;
    this.analyzingDocument.set(false);
    this.documentAnalyzed.set(false);
  }

  goBackToUploadNewFile() {
    this.goBackToCreateResult();
    this.createResultManagementService.resultPageStep.set(1);
  }

  async handleAnalyzingDocument(): Promise<void> {
    if (!this.selectedFile) {
      console.warn('No file selected.');
      return;
    }

    this.analyzingDocument.set(true);
    this.startProgress();

    try {
      const uploadResponse = await this.fileManagerService.uploadFile(this.selectedFile);
      const filename = uploadResponse.data.filename;

      if (!filename) {
        throw new Error('No se pudo obtener el nombre del archivo subido.');
      }

      const miningResponse = (await this.textMiningService.executeTextMining(filename)).content;

      if (!miningResponse?.length) {
        this.actions.showToast({ severity: 'error', summary: 'Error', detail: 'Something went wrong. Please try again.' });
        return;
      }

      let combinedResults: AIAssistantResult[] = [];
      for (const item of miningResponse) {
        if (item?.text) {
          try {
            const parsedText = JSON.parse(item.text);
            if (parsedText?.results?.length > 0) {
              combinedResults = combinedResults.concat(parsedText.results);
            }
          } catch (parseError) {
            console.error('Error parsing text:', parseError);
          }
        }
      }
      if (combinedResults.length === 0) {
        this.actions.showToast({ severity: 'error', summary: 'Error', detail: 'No results found. Please try again.' });
        return;
      }

      const mappedResults = this.mapResultRawAiToAIAssistantResult(combinedResults);
      this.createResultManagementService.items.set(mappedResults);
      this.documentAnalyzed.set(true);
    } catch (error) {
      this.actions.showToast({ severity: 'error', summary: 'Error', detail: 'Something went wrong. Please try again.' });
      throw error;
    } finally {
      this.analyzingDocument.set(false);
    }
  }

  private mapResultRawAiToAIAssistantResult(results: AIAssistantResult[]): AIAssistantResult[] {
    return results.map(result => ({
      indicator: result.indicator,
      title: result.title,
      description: result.description,
      keywords: result.keywords,
      geoscope: result.geoscope ?? [],
      training_type: result.training_type,
      total_participants: result.total_participants,
      evidence_for_stage: result.evidence_for_stage,
      policy_type: result.policy_type,
      alliance_main_contact_person_first_name: result.alliance_main_contact_person_first_name,
      alliance_main_contact_person_last_name: result.alliance_main_contact_person_last_name,
      stage_in_policy_process: result.stage_in_policy_process,
      male_participants: result.male_participants ?? 0,
      female_participants: result.female_participants ?? 0,
      non_binary_participants: result.non_binary_participants ?? '0',
      contract_code: this.body().contract_id !== null ? String(this.body().contract_id) : undefined
    }));
  }

  startProgress(): void {
    let currentStep = 0;

    this.runStep(currentStep);
    this.activeIndex.set(currentStep);
    currentStep++;

    const stepInterval = setInterval(() => {
      if (currentStep < this.steps().length) {
        this.runStep(currentStep);
        this.activeIndex.set(currentStep);
        currentStep++;
      } else {
        clearInterval(stepInterval);
      }
    }, this.getRandomInterval());
  }

  runStep(index: number): void {
    const step = this.steps()[index];
    step.inProgress = true;
    step.progress = 0;

    const duration = this.getRandomInterval();
    const increment = 100 / (duration / 300);

    const progressTimer = setInterval(() => {
      if (step.progress < 100) {
        step.progress = Math.min(step.progress + increment, 100);
        this.steps.update(steps => {
          steps[index] = { ...step };
          return [...steps];
        });
      } else {
        clearInterval(progressTimer);
        step.inProgress = false;
        step.completed = true;
        this.steps.update(steps => {
          steps[index] = { ...step };
          return [...steps];
        });
      }
    }, 300);
  }

  getRandomInterval(): number {
    return Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
  }
}
