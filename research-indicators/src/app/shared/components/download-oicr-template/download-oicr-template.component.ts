import { Component, inject, signal, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { WasmService } from '../../services/go/wasm.service';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
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
  processing = signal(false);
  result: ProcessResult | null = null;
  wasmLoaded = signal(false);
  api = inject(ApiService);
  cache = inject(CacheService);
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
  async getOicrDetails(resultCode: number) {
    const response = await this.api.GET_OICRDetails(resultCode);
    console.log(response.data);
  }
  async downloadOicrTemplate() {
    await this.getOicrDetails(this.cache.currentResultId());

    // this.processing.set(true);
    // this.result = null;

    // try {
    //   // call the WASM service
    //   this.result = await this.wasm.processDocx(this.dropdownsToProcess);
    //   const { success, fileData } = this.result;
    //   // if success and fileData, download the file
    //   if (success && fileData) {
    //     this.wasm.downloadFile(fileData, 'documento_procesado.docx');
    //   }
    // } catch (error) {
    //   this.result = {
    //     success: false,
    //     error: `Error inesperado: ${error}`
    //   };
    // } finally {
    //   this.processing.set(false);
    // }
  }
}
