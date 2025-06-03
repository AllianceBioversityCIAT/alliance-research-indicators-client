import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GetContracts } from '@shared/interfaces/get-contracts.interface';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-shared-result-form',
  imports: [SelectModule, TooltipModule, FormsModule, DatePipe],
  templateUrl: './shared-result-form.component.html'
})
export class SharedResultFormComponent implements AfterViewInit, OnChanges {
  @Input() contracts: GetContracts[] = [];
  @Input() contractId: number | null = null;
  @Input() title = 'Primary Project';
  @Input() maxLength = 117;
  @Input() showWarning = false;
  @Input() getContractStatusClasses: (status: string) => string = () => '';
  @Output() validityChanged = new EventEmitter<boolean>();
  @Output() contractIdChange = new EventEmitter<number>();

  @ViewChild('containerRef') containerRef!: ElementRef;
  containerWidth = 0;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.containerWidth = entry.contentRect.width;
        this.cdr.detectChanges();
      }
    });

    observer.observe(this.containerRef.nativeElement);
  }

  ngOnChanges() {
    this.validityChanged.emit(!this.isInvalid);
  }

  get isInvalid(): boolean {
    return !this.contractId;
  }

  onContractChange(value: number) {
    this.contractId = value;
    this.contractIdChange.emit(value);
    this.validityChanged.emit(!this.isInvalid);
  }

  getShortDescription(description: string): string {
    let max: number;
    if (this.containerWidth < 900) {
      max = 73;
    } else if (this.containerWidth < 1100) {
      max = 105;
    } else if (this.containerWidth < 1240) {
      max = 135;
    } else {
      max = 155;
    }
    return description.length > max ? description.slice(0, max) + '...' : description;
  }
}
