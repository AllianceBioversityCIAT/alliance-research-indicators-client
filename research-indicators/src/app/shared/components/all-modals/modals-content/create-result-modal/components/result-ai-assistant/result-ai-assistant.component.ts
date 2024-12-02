import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CreateResultManagementService } from '../../services/create-result-management.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-result-ai-assistant',
  standalone: true,
  imports: [CommonModule, ButtonModule, PaginatorModule],
  templateUrl: './result-ai-assistant.component.html',
  styleUrl: './result-ai-assistant.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultAiAssistantComponent implements OnInit {
  createResultManagementService = inject(CreateResultManagementService);

  acceptedFormats: string[] = ['.pdf', '.docx', '.txt'];
  maxSizeMB = 300;
  isDragging = false;
  selectedFile: File | null = null;
  analyzeDocument = signal(false);
  documentAnalyzed = signal(false);
  items = signal<any[]>([]);
  first = signal(0);
  rows = signal(5);

  ngOnInit() {
    this.items.set([
      { id: 1, title: 'Combining approaches for systemic behaviour change in groundwater governance', description: 'Over-extraction of groundwater is a prominent challenge in India, with profound implication for food security, livelihoods, and economic development. As groundwater is an mobile common pool resource, sustainable governance of groundwater is complex, multifaceted, requiring coordination among stakeholders at different scales.', type: 'INNOVATION DEVELOPMENT', keywords: ['Groundwater  Governance', 'Systemic Change', 'Behavioral Approaches'] },
      { id: 2, title: 'AI-driven solutions for climate change adaptation', description: 'Artificial Intelligence can play a significant role in climate change adaptation by providing predictive analytics, optimizing resource use, and enhancing decision-making processes.', type: 'TECHNOLOGY', keywords: ['AI', 'Climate Change', 'Adaptation'] },
      { id: 3, title: 'Sustainable agriculture practices for smallholder farmers', description: 'Implementing sustainable agriculture practices can improve the livelihoods of smallholder farmers by increasing productivity, reducing environmental impact, and enhancing resilience to climate change.', type: 'AGRICULTURE', keywords: ['Sustainable Agriculture', 'Smallholder Farmers', 'Climate Resilience'] },
      { id: 4, title: 'Renewable energy integration in urban planning', description: 'Integrating renewable energy sources into urban planning can reduce carbon emissions, enhance energy security, and promote sustainable development in cities.', type: 'ENERGY', keywords: ['Renewable Energy', 'Urban Planning', 'Sustainable Development'] },
      { id: 5, title: 'Renewable energy integration in urban planning', description: 'Integrating renewable energy sources into urban planning can reduce carbon emissions, enhance energy security, and promote sustainable development in cities.', type: 'ENERGY', keywords: ['Renewable Energy', 'Urban Planning', 'Sustainable Development'] },
      { id: 6, title: 'Renewable energy integration in urban planning', description: 'Integrating renewable energy sources into urban planning can reduce carbon emissions, enhance energy security, and promote sustainable development in cities.', type: 'ENERGY', keywords: ['Renewable Energy', 'Urban Planning', 'Sustainable Development'] },
      { id: 7, title: 'Renewable energy integration in urban planning', description: 'Integrating renewable energy sources into urban planning can reduce carbon emissions, enhance energy security, and promote sustainable development in cities.', type: 'ENERGY', keywords: ['Renewable Energy', 'Urban Planning', 'Sustainable Development'] }
    ]);
  }

  onPageChange(event: any) {
    this.first.set(event.first);
    this.rows.set(event.rows);
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
      // Handle invalid file
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
    console.log('File selected:', this.selectedFile);
    // Add your file handling logic here
  }

  handleAnalyzeDocument() {
    this.analyzeDocument.set(true);

    setTimeout(() => {
      this.analyzeDocument.set(false);
      this.documentAnalyzed.set(true);
    }, 1000);
  }

  discardResult(item: any) {
    console.log('Discarding result:', item);
  }

  createResult(item: any) {
    console.log('Creating result:', item);
  }
}
