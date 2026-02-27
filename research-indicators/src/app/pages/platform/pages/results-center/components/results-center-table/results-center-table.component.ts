import { Component, effect, inject, ViewChild, signal, AfterViewInit, computed, HostListener, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ResultsCenterService } from '../../results-center.service';
import * as ExcelJS from 'exceljs';
import { Router, RouterLink } from '@angular/router';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ApiService } from '@shared/services/api.service';
import { CustomTagComponent } from '../../../../../../shared/components/custom-tag/custom-tag.component';
import { GeneralReportItem } from '@shared/interfaces/get-general-report.interface';
import { PopoverModule } from 'primeng/popover';
import { Result } from '@shared/interfaces/result/result.interface';
import { FiltersActionButtonsComponent } from '../../../../../../shared/components/filters-action-buttons/filters-action-buttons.component';
import { SearchExportControlsComponent } from '../../../../../../shared/components/search-export-controls/search-export-controls.component';
import { PLATFORM_COLOR_MAP } from '../../../../../../shared/constants/platform-colors';
import { PLATFORM_CODES } from '../../../../../../shared/constants/platform-codes';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { CreateResultManagementService } from '@shared/components/all-modals/modals-content/create-result-modal/services/create-result-management.service';
@Component({
  selector: 'app-results-center-table',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    PopoverModule,
    InputTextModule,
    TagModule,
    MenuModule,
    RouterLink,
    CustomTagComponent,
    FiltersActionButtonsComponent,
    SearchExportControlsComponent
  ],
  templateUrl: './results-center-table.component.html'
})
export class ResultsCenterTableComponent implements AfterViewInit {
  resultsCenterService = inject(ResultsCenterService);
  private readonly router = inject(Router);
  private readonly cacheService = inject(CacheService);
  private readonly allModalsService = inject(AllModalsService);
  private readonly createResultManagementService = inject(CreateResultManagementService);
  private readonly apiService = inject(ApiService);

  @Input() showNewProjectResultButton = false;
  @ViewChild('dt2') dt2!: Table;
  tableRef = signal<Table | undefined>(undefined);
  private lastClickedElement: Element | null = null;
  private removeDocumentClickListener: (() => void) | null = null;

  menuItems: MenuItem[] = [
    { label: 'Edit', icon: 'pi pi-pencil' },
    { label: 'Delete', icon: 'pi pi-trash' },
    { label: 'Export', icon: 'pi pi-download' }
  ];

  onSearchInputChange = effect(() => {
    const searchValue = this.resultsCenterService.searchInput();
    if (this.dt2) {
      this.dt2.filterGlobal(searchValue, 'contains');
    }
  });

  setSearchInputFilter(query: string) {
    this.resultsCenterService.searchInput.set(query);
  }

  getScrollHeight = computed(
    () =>
      `calc(100vh - ${this.cacheService.headerHeight() + this.cacheService.navbarHeight() + this.cacheService.tableFiltersSidebarHeight() + (this.cacheService.hasSmallScreen() ? 280 : 350)}px)`
  );

  getActiveFiltersExcludingIndicatorTab = computed(() => {
    const activeFilters = this.resultsCenterService.getActiveFilters();
    return activeFilters.filter(filter => filter.label !== 'INDICATOR TAB');
  });

  shouldShowFilterMessage = computed(() => {
    const activeFilters = this.resultsCenterService.getActiveFilters();
    const filtersExcludingIndicatorTab = activeFilters.filter(filter => filter.label !== 'INDICATOR TAB');
    return filtersExcludingIndicatorTab.length > 0;
  });

  getFilterDisplayText(filter: { label: string; value: string; id?: string | number }): string {
    if (filter.label === 'PROJECT') {
      return `Project: ${filter.value}`;
    }
    return filter.value || filter.label;
  }

  getPrimaryContractId(result: Result): string | null {
    if (!result.result_contracts) return null;
    const contracts = Array.isArray(result.result_contracts) ? result.result_contracts : [result.result_contracts];
    const primaryContract = contracts.find((contract: { is_primary?: number | string; contract_id?: string }) => Number(contract.is_primary) === 1);
    return primaryContract?.contract_id ?? null;
  }

  getVisibleColumns() {
    const columns = this.resultsCenterService.tableColumns();
    if (!this.showNewProjectResultButton) {
      return columns;
    }
    return columns.filter(column => column.field !== 'project' && column.field !== 'lever');
  }

  getPlatformColors(platformCode: string): { text: string; background: string } | undefined {
    return PLATFORM_COLOR_MAP[platformCode];
  }

  formatResultCode(code: string | number): string {
    if (!code) return String(code || '');
    return String(code).padStart(3, '0');
  }

  private adjustColumnWidth(worksheet: ExcelJS.Worksheet, columnNumber: number, maxWidth = 70, minWidth = 15) {
    const column = worksheet.getColumn(columnNumber);
    if (column) {
      let maxLength = column.header?.toString().length ?? 0;

      column.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber > 1) {
          const cellText = cell.text ?? '';
          const textLength = cellText.toString().length;
          maxLength = Math.max(maxLength, textLength);
        }
      });

      column.width = Math.min(Math.max(maxLength + 2, minWidth), maxWidth);
    }
  }

  private styleHeaderColumns(worksheet: ExcelJS.Worksheet, totalColumns: number) {
    worksheet.views = [
      {
        state: 'frozen',
        ySplit: 1,
        xSplit: 0,
        rightToLeft: false,
        showGridLines: true,
        zoomScale: 100
      }
    ];

    // Enable autoFilter for all columns
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: totalColumns }
    };

    // Style only the used columns
    for (let i = 1; i <= totalColumns; i++) {
      const cell = worksheet.getRow(1).getCell(i);
      worksheet.getRow(1).height = 30;
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.font = {
        color: { argb: 'FFFFFF' },
        size: 16,
        bold: true
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '204887' }
      };
    }

    // Hide all columns after our data
    for (let i = totalColumns + 1; i <= worksheet.columnCount; i++) {
      worksheet.getColumn(i).hidden = true;
    }
  }

  async exportTable() {
    try {
      const response = await this.apiService.GET_GeneralReport();
      const exportData: GeneralReportItem[] = response?.data ?? [];

      if (exportData.length === 0) {
        console.warn('No data to export');
        return;
      }

      const cleanString = (str: string): string => {
        let cleaned = '';
        for (let i = 0; i < str.length; i++) {
          const char = str[i];
          const code = str.codePointAt(i) ?? 0;
          if (code >= 32 || code === 9 || code === 10 || code === 13) {
            cleaned += char;
          }
        }
        return cleaned;
      };

      const sanitizeValue = (value: unknown): string | number => {
        if (value === null || value === undefined || value === '') {
          return '';
        }
        const valueType = typeof value;
        if (valueType === 'number') {
          const numValue = value as number;
          return Number.isNaN(numValue) || !Number.isFinite(numValue) ? '' : numValue;
        }
        if (valueType === 'boolean') {
          return (value as boolean) ? 'TRUE' : 'FALSE';
        }
        if (valueType === 'object') {
          try {
            const jsonStr = JSON.stringify(value);
            return jsonStr.length > 32767 ? jsonStr.substring(0, 32764) + '...' : jsonStr;
          } catch {
            return '';
          }
        }
        if (valueType === 'string') {
          const strValue = value as string;
          const trimmed = strValue.trim();
          if (trimmed.length === 0) {
            return '';
          }
          const cleaned = cleanString(trimmed);
          return cleaned.length > 32767 ? cleaned.substring(0, 32764) + '...' : cleaned;
        }
        return '';
      };

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Research Indicators';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Results', {
        views: [{ state: 'frozen', ySplit: 1 }],
        properties: {
          defaultRowHeight: 20,
          showGridLines: false
        }
      });

      const allKeys = new Set<string>();
      exportData.forEach((row: GeneralReportItem) => {
        if (row && typeof row === 'object') {
          Object.keys(row).forEach(key => allKeys.add(key));
        }
      });
      const headers = Array.from(allKeys);

      if (headers.length === 0) {
        console.warn('No headers found in data');
        return;
      }

      worksheet.columns = headers.map(header => ({
        header,
        key: header,
        width: 15,
        hidden: false
      }));

      exportData.forEach((row: GeneralReportItem, rowIndex: number) => {
        try {
          const rowValues: (string | number)[] = [];
          headers.forEach(header => {
            try {
              const value = (row as Record<string, unknown>)[header];
              const sanitized = sanitizeValue(value);
              rowValues.push(sanitized);
            } catch (error) {
              console.warn(`Error accessing property "${header}" in row ${rowIndex}:`, error);
              rowValues.push('');
            }
          });
          if (rowValues.length === headers.length) {
            worksheet.addRow(rowValues);
          } else {
            console.warn(`Row ${rowIndex} has ${rowValues.length} values but expected ${headers.length}, skipping`);
          }
        } catch (error) {
          console.warn(`Error processing row ${rowIndex}, skipping:`, error);
        }
      });

      headers.forEach((header, index) => {
        const column = worksheet.getColumn(index + 1);
        if (header.includes('Title') || header.includes('Description')) {
          column.width = 50;
        } else if (header.includes('Project') || header.includes('Creator')) {
          column.width = 30;
        } else {
          column.width = 20;
        }
      });

      this.styleHeaderColumns(worksheet, headers.length);

      const buffer = await workbook.xlsx.writeBuffer();

      if (!buffer || buffer.byteLength === 0) {
        console.error('Generated buffer is empty or invalid');
        return;
      }

      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const now = new Date();
      const formattedDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
      const userData = this.cacheService.dataCache().user;
      const userName = `${userData.first_name}_${userData.last_name}`.toLowerCase().replace(' ', '_');
      link.download = `general_report_${userName}_${formattedDate}.xlsx`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        link.remove();
        globalThis.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error exporting file:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
    }
  }

  showFiltersSidebar() {
    this.resultsCenterService.showFiltersSidebar.set(true);
  }

  showConfiguratiosnSidebar() {
    this.resultsCenterService.showConfigurationsSidebar.set(true);
  }

  openCreateResultForProject() {
    const contractId = this.resultsCenterService.primaryContractId();
    if (!contractId) {
      return;
    }
    this.createResultManagementService.setContractId(contractId);
    this.createResultManagementService.setPresetFromProjectResultsTable(true);
    this.allModalsService.openModal('createResult');
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined {
    const severityMap: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined> = {
      SUBMITTED: 'info',
      ACCEPTED: 'success',
      EDITING: 'warn'
    };
    return severityMap[status];
  }

  openResult(result: Result) {
    this.resultsCenterService.clearAllFilters();
    if (
      result.platform_code === PLATFORM_CODES.PRMS ||
      result.platform_code === PLATFORM_CODES.TIP ||
      result.platform_code === PLATFORM_CODES.AICCRA
    ) {
      this.allModalsService.selectedResultForInfo.set(result);
      this.allModalsService.openModal('resultInformation');
      return;
    }
    this.closeResultInformationModal();
    const resultCode = `${result.platform_code}-${result.result_official_code}`;
    if (result.result_status?.result_status_id === 6 && Array.isArray(result.snapshot_years) && result.snapshot_years.length > 0) {
      const latestYear = Math.max(...result.snapshot_years);
      this.router.navigate(['/result', resultCode, 'general-information'], { queryParams: { version: latestYear } });
    } else {
      this.router.navigate(['/result', resultCode]);
    }
  }

  openResultByYear(result: number, year: string | number, platformCode: string) {
    if (platformCode === PLATFORM_CODES.PRMS || platformCode === PLATFORM_CODES.AICCRA || platformCode === PLATFORM_CODES.TIP) {
      return;
    }
    this.closeResultInformationModal();
    this.resultsCenterService.clearAllFilters();
    const resultCode = `${platformCode}-${result}`;
    this.router.navigate(['/result', resultCode], {
      queryParams: { version: year }
    });
  }

  getResultHref(result: Result): string {
    if (
      result.platform_code === PLATFORM_CODES.PRMS ||
      result.platform_code === PLATFORM_CODES.AICCRA ||
      result.platform_code === PLATFORM_CODES.TIP
    ) {
      this.onResultLinkClick(result);
      return '';
    }
    const resultCode = `${result.platform_code}-${result.result_official_code}`;
    if (result.result_status?.result_status_id === 6 && Array.isArray(result.snapshot_years) && result.snapshot_years.length > 0) {
      const latestYear = Math.max(...result.snapshot_years);
      return this.router
        .createUrlTree(['/result', resultCode, 'general-information'], {
          queryParams: { version: latestYear }
        })
        .toString();
    }
    return `/result/${resultCode}`;
  }

  getResultRouteArray(result: Result): string | string[] {
    if (
      result.platform_code === PLATFORM_CODES.TIP ||
      result.platform_code === PLATFORM_CODES.PRMS ||
      result.platform_code === PLATFORM_CODES.AICCRA
    ) {
      return [];
    }
    const resultCode = `${result.platform_code}-${result.result_official_code}`;
    if (result.result_status?.result_status_id === 6 && Array.isArray(result.snapshot_years) && result.snapshot_years.length > 0) {
      return ['/result', resultCode, 'general-information'];
    }
    return ['/result', resultCode];
  }

  @HostListener('click', ['$event'])
  onHostClick(event: MouseEvent) {
    const target = event.target as Element;
    this.processRowClick(target, event);
  }

  getResultQueryParams(result: Result): { version?: number } {
    if (result.result_status?.result_status_id === 6 && Array.isArray(result.snapshot_years) && result.snapshot_years.length > 0) {
      const latestYear = Math.max(...result.snapshot_years);
      return { version: latestYear };
    }
    return {};
  }

  onResultLinkClick(result: Result): void {
    if (
      result.platform_code === PLATFORM_CODES.TIP ||
      result.platform_code === PLATFORM_CODES.PRMS ||
      result.platform_code === PLATFORM_CODES.AICCRA
    ) {
      this.allModalsService.selectedResultForInfo.set(result);
      this.allModalsService.openModal('resultInformation');
    }
  }

  ngAfterViewInit() {
    this.tableRef.set(this.dt2);
    this.resultsCenterService.tableRef.set(this.dt2);

    const onDocClickCapture = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      this.processRowClick(target, event);
    };

    document.addEventListener('click', onDocClickCapture, { capture: true });
    this.removeDocumentClickListener = () => document.removeEventListener('click', onDocClickCapture, { capture: true } as unknown as boolean);
  }

  private processRowClick(target: Element, event: MouseEvent) {
    if (this.allModalsService.isAnyModalOpen()) {
      return;
    }

    if (!this.dt2?.el?.nativeElement) {
      return;
    }
    const tableElement = this.dt2.el.nativeElement;
    if (!tableElement.contains(target)) {
      return;
    }

    this.lastClickedElement = target;

    if (
      target.closest('.p-calendar') ||
      target.closest('.p-datepicker') ||
      target.closest('.p-calendar-panel') ||
      target.closest('.p-datepicker-panel') ||
      target.closest('[class*="p-calendar"]') ||
      target.closest('[class*="p-datepicker"]')
    ) {
      return;
    }

    if (target.closest('thead') || target.closest('th') || target.tagName.toLowerCase() === 'th') {
      return;
    }

    const rowEl = target.closest('tr');
    if (!rowEl) return;

    const tbody = rowEl.parentElement;
    if (!tbody || tbody.tagName.toLowerCase() !== 'tbody') return;

    const resultId = rowEl.dataset['resultId'];
    const platformCode = rowEl.dataset['platform'];

    if (!resultId || !platformCode) {
      const rows = Array.from(tbody.children).filter(el => el.tagName.toLowerCase() === 'tr');
      const rowIndex = rows.indexOf(rowEl);
      if (rowIndex < 0) return;
      const data: Result[] = (this.dt2.value as Result[] | undefined) ?? this.resultsCenterService.list();
      const pageStart: number = this.dt2.first || 0;
      const idx = pageStart + rowIndex;
      const result = data[idx];

      if (!result) {
        return;
      }

      this.handleRowClickResult(result, target, event);
      return;
    }

    const data: Result[] = (this.dt2.value as Result[] | undefined) ?? this.resultsCenterService.list();
    const result = data.find(r => r.result_official_code?.toString() === resultId && r.platform_code === platformCode);

    if (!result) {
      return;
    }

    this.handleRowClickResult(result, target, event);
  }

  private handleRowClickResult(result: Result, target: Element, event: MouseEvent): void {
    if (result.platform_code === PLATFORM_CODES.STAR) {
      this.closeResultInformationModal();
      return;
    }

    if (target.closest('.project-cell') || target.closest('.project-link') || target.classList.contains('project-link')) {
      if (result.result_contracts?.contract_id) {
        event.preventDefault();
        event.stopPropagation();
        this.router.navigate(['/project-detail', result.result_contracts.contract_id, 'project-results']);
      }
      return;
    }

    if (
      result.platform_code !== PLATFORM_CODES.PRMS &&
      result.platform_code !== PLATFORM_CODES.TIP &&
      result.platform_code !== PLATFORM_CODES.AICCRA &&
      target.closest('a[routerLink], span[routerLink], [ng-reflect-router-link]')
    ) {
      return;
    }

    if (
      result.platform_code === PLATFORM_CODES.PRMS ||
      result.platform_code === PLATFORM_CODES.TIP ||
      result.platform_code === PLATFORM_CODES.AICCRA
    ) {
      event.preventDefault();
      event.stopPropagation();
      this.allModalsService.selectedResultForInfo.set(result);
      this.allModalsService.openModal('resultInformation');
    }
  }

  private closeResultInformationModal(): void {
    if (this.allModalsService.isModalOpen('resultInformation').isOpen) {
      this.allModalsService.closeModal('resultInformation');
    }
    this.allModalsService.selectedResultForInfo.set(null);
  }
}
