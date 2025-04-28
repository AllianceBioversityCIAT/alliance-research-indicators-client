import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
import { ResultRawAi, TextMiningService } from '@shared/services/text-mining.service';
import { CacheService } from '@shared/services/cache/cache.service';

@Component({
  selector: 'app-result-ai-assistant',
  imports: [CommonModule, ButtonModule, PaginatorModule, ResultAiItemComponent],
  templateUrl: './result-ai-assistant.component.html',
  styleUrl: './result-ai-assistant.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultAiAssistantComponent {
  acceptedFormats: string[] = ['.pdf', '.docx', '.txt'];
  maxSizeMB = 300;
  isDragging = false;
  selectedFile: File | null = null;
  analyzingDocument = signal(false);
  documentAnalyzed = signal(false);
  first = signal(0);
  rows = signal(5);
  expandedItem = signal<AIAssistantResult | null>(null);

  TP = inject(ToPromiseService);
  actions = inject(ActionsService);
  createResultManagementService = inject(CreateResultManagementService);
  allModalsService = inject(AllModalsService);
  fileManagerService = inject(FileManagerService);
  textMiningService = inject(TextMiningService);
  cache = inject(CacheService);

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
      console.error('Invalid file type or size');
      this.actions.showToast({ severity: 'error', summary: 'Error', detail: 'Invalid file type or size' });
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

    try {
      // 1. Subir el archivo
      const uploadResponse = await this.fileManagerService.uploadFile(this.selectedFile, String(this.cache.dataCache().user.sec_user_id));

      const filename = uploadResponse.data.filename;

      if (!filename) {
        throw new Error('No se pudo obtener el nombre del archivo subido.');
      }

      // 2. Ejecutar text mining con el nombre del archivo
      const miningResponse = (await this.textMiningService.executeTextMining(filename)).content;

      if (!miningResponse?.length) {
        this.actions.showToast({ severity: 'error', summary: 'Error', detail: 'Something went wrong. Please try again.' });
        return;
      }

      let combinedResults: ResultRawAi[] = [];

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

  private mapResultRawAiToAIAssistantResult(results: ResultRawAi[]): AIAssistantResult[] {
    return results.map(result => ({
      indicator: result.indicator,
      title: result.title,
      description: result.description,
      keywords: result.keywords,
      geoscope: result.geoscope.sub_list ?? [],
      training_type: result.training_type,
      total_participants: result.total_participants,
      male_participants: result.male_participants ?? 0,
      female_participants: result.female_participants ?? 0,
      non_binary_participants: result.non_binary_participants ?? '0'
    }));
  }
}
