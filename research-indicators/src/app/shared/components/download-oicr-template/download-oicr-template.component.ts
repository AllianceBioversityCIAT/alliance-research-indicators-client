import { Component, inject, signal, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { WasmService } from '../../services/go/wasm.service';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { GetOICRDetails, Region, Country } from '@shared/interfaces/gets/get-oicr-details.interface';
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

  fieldsToProcess: { dropdownId: string; selectedValue: string; attribute: string; type: string }[] = [
    {
      dropdownId: '2132273794',
      selectedValue: '',
      attribute: 'tag_name_text',
      type: 'text'
    },
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
      dropdownId: '-547993178',
      selectedValue: '',
      attribute: 'geographic_scope',
      type: 'dropdown'
    },
    {
      dropdownId: '-515767717',
      selectedValue: '',
      attribute: 'geographic_scope_comments',
      type: 'text'
    },
    {
      dropdownId: '1209379648',
      selectedValue: '',
      attribute: 'other_projects_text',
      type: 'text'
    },
    {
      dropdownId: '-504483',
      selectedValue: '',
      attribute: 'regions_countries_text',
      type: 'text'
    },
    {
      dropdownId: '1308358992',
      selectedValue: '',
      attribute: 'main_levers_text',
      type: 'text'
    },
    {
      dropdownId: '539860219',
      selectedValue: '',
      attribute: 'others_levers_text',
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

  // getGeoScopeText(geoScopeId: string) {
  //   const geoScopes = {
  //     '1': 'Global',
  //     // '': 'Multi-region',
  //     // '': 'Multi-country',
  //     '2': 'Regional',
  //     // '': 'Sub-regional',
  //     '4': 'National',
  //     '5': 'Sub-national',
  //     '50': 'This is yet to be determined'
  //   };
  //   return geoScopes[geoScopeId as keyof typeof geoScopes];
  // }

  //? •	Title → -1461958722 → Texto
  //? •	Main project → -1815635536 → Texto
  //? •	Other contributing projects → 1964384726 → Texto (Repetible: contenedor=1972143100, item=1915110532) ALLIANCE ALIGNMENT
  //? •	Tagging (Tag as) → 1527089857 → DropDown map ids
  //! •	OICR handle (solo para actualizaciones) → 1079386482 → Texto
  //? •	Elaboration of outcome/impact statement → -1005152857 → Texto
  //* •	Primary Levers → 771681199 → DropDown BUG no guarda en la creación esta en el inicio
  //* •	Other Contributing Levers → -63980865 → DropDown en la creaccion
  //? •	Geographic scope → -750698587 → DropDown
  //? •	Regions / Countries (campo de texto único) → -1355309710 → Texto
  //? •	Geographic Scope comments → -515767717 → Texto

  /**
   * Formats regions and countries with titles and line breaks for Word document
   * @param regions Array of regions
   * @param countries Array of countries
   * @returns Formatted string with titles and line breaks
   */
  formatRegionsAndCountries(regions: Region[], countries: Country[]): string {
    let result = '';

    // Add regions section if there are regions
    if (regions && regions.length > 0) {
      result += 'Regions:\n';
      const regionNames = regions.map(region => region.region_name).join(', ');
      result += regionNames;
    }

    // Add countries section if there are countries
    if (countries && countries.length > 0) {
      // Add line break between sections if we have both
      if (result.length > 0) {
        result += '\n\n';
      }
      result += 'Countries:\n';
      const countryNames = countries.map(country => country.country_name).join(', ');
      result += countryNames;
    }

    return result;
  }

  mapFieldsToProcess(oicrDetails: GetOICRDetails) {
    this.fieldsToProcess.forEach(field => {
      field.selectedValue = oicrDetails[field.attribute as keyof GetOICRDetails] as string;
    });
  }

  ngOnInit(): void {
    this.wasm.loadWasm().then(loaded => {
      this.wasmLoaded.set(loaded);
    });
  }
  async getOicrDetails(resultCode: number) {
    const response = await this.api.GET_OICRDetails(resultCode);
    response.data.other_projects_text = response.data.other_projects.map(project => project.project_id + ' - ' + project.project_title).join('\n\n');

    // Use the new method to format regions and countries
    response.data.regions_countries_text = this.formatRegionsAndCountries(response.data.regions, response.data.countries);
    response.data.tag_name_text = this.getTagAsText(response.data.tag_id.toString());
    response.data.others_levers_text = response.data.other_levers?.map(lever => lever.lever_full).join('\n\n');
    response.data.main_levers_text = response.data.main_levers?.map(lever => lever.main_lever_name).join('\n\n');

    this.mapFieldsToProcess(response.data);

    // console.log(response.data);
  }
  async downloadOicrTemplate() {
    await this.getOicrDetails(this.cache.currentResultId());

    // console.log(this.fieldsToProcess);

    this.processing.set(true);
    this.result = null;

    try {
      // call the WASM service
      this.result = await this.wasm.processDocx(this.fieldsToProcess.filter(field => field.selectedValue));
      const { success, fileData } = this.result;
      // if success and fileData, download the file
      if (success && fileData) {
        const now = new Date();
        const dateTimeString =
          now.getFullYear().toString() +
          (now.getMonth() + 1).toString().padStart(2, '0') +
          now.getDate().toString().padStart(2, '0') +
          '_' +
          now.getHours().toString().padStart(2, '0') +
          now.getMinutes().toString().padStart(2, '0');
        this.wasm.downloadFile(fileData, `STAR_OICR_${this.cache.currentResultId()}_${dateTimeString}.docx`);
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
