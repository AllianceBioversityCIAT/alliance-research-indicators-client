import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CreateResultManagementService } from '../../services/create-result-management.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ToPromiseService } from '../../../../../../services/to-promise.service';
import { ActionsService } from '../../../../../../services/actions.service';

interface Item {
  indicator: string;
  title: string;
  description: string;
  keywords: string[];
  geoscope: {
    level: string;
    sub_list: string[];
  };
  training_type: string;
  total_participants: number;
  non_binary_participants: number;
  female_participants: number;
  male_participants: number;
}

type DetailValue = 'total_participants' | 'non_binary_participants' | 'female_participants' | 'male_participants';

@Component({
  selector: 'app-result-ai-assistant',
  standalone: true,
  imports: [CommonModule, ButtonModule, PaginatorModule],
  templateUrl: './result-ai-assistant.component.html',
  styleUrl: './result-ai-assistant.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultAiAssistantComponent {
  createResultManagementService = inject(CreateResultManagementService);

  indicatorTypeIcon = [
    { icon: 'group', type: 'Capacity Sharing for Development', class: 'output-icon' },
    { icon: 'flag', type: 'Innovation Development', class: 'output-icon' },
    { icon: 'lightbulb', type: 'Knowledge Product', class: 'output-icon' },
    { icon: 'wb_sunny', type: 'Innovation Use', class: 'outcome-icon' },
    { icon: 'pie_chart', type: 'Research Output', class: 'outcome-icon' },
    { icon: 'folder_open', type: 'Policy Change', class: 'outcome-icon' }
  ];

  acceptedFormats: string[] = ['.pdf', '.docx', '.txt'];
  maxSizeMB = 300;
  isDragging = false;
  selectedFile: File | null = null;
  analyzingDocument = signal(false);
  documentAnalyzed = signal(false);
  items = signal<Item[]>([]);
  first = signal(0);
  rows = signal(5);
  expandedItem = signal<Item | null>(null);

  expandedItemDetails = [
    { title: 'Total participants', value: 'total_participants' as DetailValue },
    { title: 'Non-binary', value: 'non_binary_participants' as DetailValue },
    { title: 'Female', value: 'female_participants' as DetailValue },
    { title: 'Male', value: 'male_participants' as DetailValue }
  ];

  TP = inject(ToPromiseService);
  actions = inject(ActionsService);

  goBack() {
    if (this.analyzingDocument()) return;

    if (this.documentAnalyzed()) {
      this.selectedFile = null;
      this.items.set([]);
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

  async handleAnalyzingDocument() {
    if (!this.selectedFile) return;

    this.analyzingDocument.set(true);
    const form = new FormData();
    form.append('file', this.selectedFile);
    const result = await this.TP.post(`results/ai/create`, form);

    if (!result?.data?.data) {
      this.analyzingDocument.set(false);
      this.actions.showToast({ severity: 'error', summary: 'Error', detail: 'Something went wrong. Please try again.' });
      return;
    }

    if (result?.data?.data?.results?.length === 0) {
      this.analyzingDocument.set(false);
      this.actions.showToast({ severity: 'error', summary: 'Error', detail: 'No results found. Please try again.' });
      return;
    }

    if (result.successfulRequest) {
      this.items.set(result.data.data.results);
      this.analyzingDocument.set(false);
      this.documentAnalyzed.set(true);
    }
  }

  discardResult(item: Item) {
    this.items.update(items => items.filter(i => i !== item));
  }

  createResult(item: Item) {
    console.error('Creating result:', item);
  }

  getIndicatorTypeIcon(type: string) {
    return {
      class: this.indicatorTypeIcon.find(icon => icon.type === type)?.class,
      icon: this.indicatorTypeIcon.find(icon => icon.type === type)?.icon
    };
  }

  toggleExpand(item: Item) {
    this.expandedItem.set(this.expandedItem() === item ? null : item);
  }
}
