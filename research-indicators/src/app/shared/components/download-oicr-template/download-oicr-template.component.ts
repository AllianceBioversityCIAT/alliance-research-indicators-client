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

interface FieldToProcess {
  dropdownId: string;
  selectedValue: string;
  attribute: string;
  type: string;
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

  // Field configuration with minimal duplication
  private readonly fieldConfig = [
    ['2132273794', 'tag_name_text', 'text'],
    ['-1191449392', 'title', 'text'],
    ['-1815635536', 'main_project', 'text'],
    ['1376114886', 'outcome_impact_statement', 'text'],
    ['-547993178', 'geographic_scope', 'dropdown'],
    ['-515767717', 'geographic_scope_comments', 'text'],
    ['1209379648', 'other_projects_text', 'text'],
    ['-504483', 'regions_countries_text', 'text'],
    ['1308358992', 'main_levers_text', 'text'],
    ['539860219', 'others_levers_text', 'text']
  ] as const;

  fieldsToProcess: FieldToProcess[] = this.fieldConfig.map(([dropdownId, attribute, type]) => ({
    dropdownId,
    selectedValue: '',
    attribute,
    type
  }));

  getTagAsText(tagId: string) {
    const tags = {
      '1': 'New OICR',
      '2': 'Updated OICR (Same Level of Maturity)',
      '3': 'Updated OICR (New Level of Maturity)'
    };
    return tags[tagId as keyof typeof tags];
  }

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
  }
  async downloadOicrTemplate() {
    await this.getOicrDetails(this.cache.currentResultId());
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
