import { Component, inject, signal, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { WasmService } from '../../services/go/wasm.service';
export interface ProcessResult {
  success: boolean;
  message?: string;
  error?: string;
  fileData?: ArrayBuffer | Uint8Array;
}

@Component({
  selector: 'app-download-oicr-template',
  imports: [ButtonModule],
  templateUrl: './download-oicr-template.component.html',
  styleUrl: './download-oicr-template.component.scss'
})
export class DownloadOicrTemplateComponent implements OnInit {
  wasm = inject(WasmService);
  processing = false;
  result: ProcessResult | null = null;
  wasmLoaded = signal(false);
  dropdownsToProcess = [
    {
      dropdownId: '2132273794',
      selectedValue: 'New OICR',
      type: 'dropdown'
    },
    {
      dropdownId: '-1815635536',
      selectedValue: 'Works from star',
      type: 'text'
    }
  ];
  async ngOnInit() {
    const wasmLoaded = await this.wasm.loadWasm();

    if (wasmLoaded) {
      this.wasmLoaded.set(true);
    } else {
      this.wasmLoaded.set(false);
    }
  }
  async downloadOicrTemplate() {
    this.processing = true;
    this.result = null;

    try {
      // call the WASM service
      const result = await this.wasm.processDocx(this.dropdownsToProcess);
      this.result = result;
      // if success and fileData, download the file
      if (result.success && result.fileData) {
        this.wasm.downloadFile(result.fileData, 'documento_procesado.docx');
      }
    } catch (error) {
      this.result = {
        success: false,
        error: `Error inesperado: ${error}`
      };
    } finally {
      this.processing = false;
    }
  }
}
