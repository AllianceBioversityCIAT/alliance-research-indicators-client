import { Component, inject, signal, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { WasmService } from '../../services/go/wasm.service';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { GetOICRDetails } from '@shared/interfaces/gets/get-oicr-details.interface';
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

  fieldsToProcess = [
    {
      dropdownId: '-1191449392',
      selectedValue: '',
      attribute: 'title',
      type: 'text'
    },
    {
      dropdownId: '-1815635536',
      selectedValue: '',
      attribute: 'main_project',
      type: 'text'
    },
    {
      dropdownId: '1376114886',
      selectedValue: '',
      attribute: 'outcome_impact_statement',
      type: 'text'
    },
    {
      dropdownId: '-1355309710', // TODO: Update this field
      selectedValue: '',
      attribute: 'title',
      type: 'text'
    },
    {
      dropdownId: '-515767717',
      selectedValue: '',
      attribute: 'geographic_scope_comments',
      type: 'text'
    }
  ];

  getTagAsText(tagId: string) {
    const tags = {
      '1': 'New OICR',
      '2': 'Updated OICR (Same Level of Maturity)',
      '3': 'Updated OICR (New Level of Maturity)'
    };
    return tags[tagId as keyof typeof tags];
  }

  getGeoScopeText(geoScopeId: string) {
    const geoScopes = {
      '1': 'Global',
      '2': 'Multi-region',
      '3': 'Multi-country',
      '4': 'Regional',
      '5': 'Sub-regional',
      '6': 'National',
      '7': 'Sub-national'
    };
    return geoScopes[geoScopeId as keyof typeof geoScopes];
  }

  //? •	Title → -1461958722 → Texto
  //? •	Main project → -1815635536 → Texto
  //TODO •	Other contributing projects → 1964384726 → Texto (Repetible: contenedor=1972143100, item=1915110532) ALLIANCE ALIGNMENT
  //TODO •	Tagging (Tag as) → 1527089857 → DropDown map ids
  //! •	OICR handle (solo para actualizaciones) → 1079386482 → Texto
  //? •	Elaboration of outcome/impact statement → -1005152857 → Texto
  //* •	Primary Levers → 771681199 → DropDown BUG no guarda en la creación esta en el inicio
  //* •	Other Contributing Levers → -63980865 → DropDown en la creaccion
  // •	Geographic scope → -750698587 → DropDown
  // •	Regions / Countries (campo de texto único) → -1355309710 → Texto
  //? •	Geographic Scope comments → -515767717 → Texto

  mapFieldsToProcess(oicrDetails: GetOICRDetails) {
    this.fieldsToProcess.forEach(field => {
      field.selectedValue = oicrDetails[field.attribute as keyof GetOICRDetails];
    });

    console.log(this.fieldsToProcess);
  }

  async ngOnInit() {
    this.wasmLoaded.set(await this.wasm.loadWasm());
  }
  async getOicrDetails(resultCode: number) {
    const response = await this.api.GET_OICRDetails(resultCode);
    this.mapFieldsToProcess(response.data);
    console.log(response.data);
  }
  async downloadOicrTemplate() {
    await this.getOicrDetails(this.cache.currentResultId());

    this.processing.set(true);
    this.result = null;

    try {
      // call the WASM service
      this.result = await this.wasm.processDocx(this.fieldsToProcess);
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
      this.processing.set(false);
    }
  }
}
