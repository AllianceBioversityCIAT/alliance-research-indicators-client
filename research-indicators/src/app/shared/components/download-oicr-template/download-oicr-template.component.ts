import { Component, inject, signal, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { WasmService } from '../../services/go/wasm.service';
export interface ProcessResult {
  success: boolean;
  message?: string;
  error?: string;
  fileData?: ArrayBuffer | Uint8Array;
}

@Component({
  selector: 'app-download-oicr-template',
  imports: [ButtonModule, TooltipModule],
  templateUrl: './download-oicr-template.component.html'
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
    this.wasmLoaded.set(await this.wasm.loadWasm());
  }
  async downloadOicrTemplate() {
    this.processing = true;
    this.result = null;

    try {
      // call the WASM service
      this.result = await this.wasm.processDocx(this.dropdownsToProcess);
      const { success, fileData } = this.result;
      // if success and fileData, download the file
      if (success && fileData) {
        this.wasm.downloadFile(fileData, 'documento_procesado.docx');
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
