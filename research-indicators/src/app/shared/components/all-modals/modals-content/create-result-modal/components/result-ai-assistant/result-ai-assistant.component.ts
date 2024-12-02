import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CreateResultManagementService } from '../../services/create-result-management.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ToPromiseService } from '../../../../../../services/to-promise.service';

interface Item {
  indicator: string;
  title: string;
  description: string;
  keywords: string[];
  geoscope: {
    level: string;
    sub_list: string[];
  };
}

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

  acceptedFormats: string[] = ['.pdf', '.docx', '.txt'];
  maxSizeMB = 300;
  isDragging = false;
  selectedFile: File | null = null;
  analyzeDocument = signal(false);
  documentAnalyzed = signal(false);
  items = signal<Item[]>([]);
  first = signal(0);
  rows = signal(5);
  TP = inject(ToPromiseService);

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

  async handleAnalyzeDocument() {
    if (!this.selectedFile) return;

    this.analyzeDocument.set(true);
    const form = new FormData();
    form.append('file', this.selectedFile);
    const result = await this.TP.post(`results/ai/create`, form);

    if (result?.data?.data?.results?.length === 0) {
      this.analyzeDocument.set(false);
      return;
    }

    if (result.successfulRequest) {
      this.items.set(result.data.data.results);
      this.analyzeDocument.set(false);
      this.documentAnalyzed.set(true);
    }
  }

  discardResult(item: Item) {
    console.error('Discarding result:', item);
  }

  createResult(item: Item) {
    console.error('Creating result:', item);
  }
}
