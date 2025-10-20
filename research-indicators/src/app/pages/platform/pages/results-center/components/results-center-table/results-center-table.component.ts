import { Component, effect, inject, ViewChild, signal, AfterViewInit, computed, HostListener } from '@angular/core';
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
import { CustomTagComponent } from '../../../../../../shared/components/custom-tag/custom-tag.component';
import { PopoverModule } from 'primeng/popover';
import { Result } from '@shared/interfaces/result/result.interface';
import { FiltersActionButtonsComponent } from '../../../../../../shared/components/filters-action-buttons/filters-action-buttons.component';
import { SearchExportControlsComponent } from '../../../../../../shared/components/search-export-controls/search-export-controls.component';
import { PLATFORM_COLOR_MAP } from '../../../../../../shared/constants/platform-colors';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
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

  setSearchInputFilter($event: Event) {
    this.resultsCenterService.searchInput.set(($event.target as HTMLInputElement).value);
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
    // Test data
    const exportData =
      (this.dt2.filteredValue ?? this.resultsCenterService.list())?.map(result => ({
        Code: result.result_official_code,
        Title: result.title,
        Indicator: result.indicators?.name ?? '',
        Status: result.result_status?.name ?? '',
        Project: result.result_contracts?.contract_id ?? 'Not provided',
        Lever: result.result_levers?.lever?.short_name ?? '',
        Year: result.report_year_id ?? '',
        Creator: result.created_by_user ? `${result.created_by_user.first_name} ${result.created_by_user.last_name}` : '',
        'Creation date': result.created_at ? new Date(result.created_at).toLocaleDateString() : ''
      })) ?? [];

    // Create a new workbook and worksheet
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

    // Add headers and set basic column widths
    worksheet.columns = Object.keys(exportData[0]).map(header => ({
      header,
      key: header,
      width: 15,
      hidden: false
    }));

    // Add data
    exportData.forEach(row => {
      worksheet.addRow(row);
    });

    // Adjust column widths with specific minimums for each column
    this.adjustColumnWidth(worksheet, 2, 70); // Title column
    this.adjustColumnWidth(worksheet, 3, 100); // Description column
    this.adjustColumnWidth(worksheet, 5, 70); // Indicator Name column
    this.adjustColumnWidth(worksheet, 8, 70); // Status column
    this.adjustColumnWidth(worksheet, 9, 70, 20); // Project column

    // Style header columns
    this.styleHeaderColumns(worksheet, Object.keys(exportData[0]).length);

    try {
      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const now = new Date();
      const formattedDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
      const userData = this.cacheService.dataCache().user;
      const userName = `${userData.first_name}_${userData.last_name}`.toLowerCase().replace(' ', '_');
      link.download = `export_${userName}_${formattedDate}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting file:', error);
    }
  }

  showFiltersSidebar() {
    this.resultsCenterService.showFiltersSidebar.set(true);
  }

  showConfiguratiosnSidebar() {
    this.resultsCenterService.showConfigurationsSidebar.set(true);
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
    if (result.platform_code === 'PRMS') {
      this.allModalsService.selectedResultForInfo.set(result);
      this.allModalsService.openModal('resultInformation');
      return;
    }
    const resultCode = `${result.platform_code}-${result.result_official_code}`;
    if (result.result_status?.result_status_id === 6 && Array.isArray(result.snapshot_years) && result.snapshot_years.length > 0) {
      const latestYear = Math.max(...result.snapshot_years);
      this.router.navigate(['/result', resultCode, 'general-information'], { queryParams: { version: latestYear } });
    } else {
      this.router.navigate(['/result', resultCode]);
    }
  }

  openResultByYear(result: number, year: string | number, platformCode: string) {
    if (platformCode === 'PRMS') {
      return;
    }
    this.resultsCenterService.clearAllFilters();
    const resultCode = `${platformCode}-${result}`;
    this.router.navigate(['/result', resultCode], {
      queryParams: { version: year }
    });
  }

  getResultHref(result: Result): string {
    if (result.platform_code === 'PRMS') {
      this.onResultLinkClick(result);
      return '';
    }
    const resultCode = `${result.platform_code}-${result.result_official_code}`;
    if (result.result_status?.result_status_id === 6 && Array.isArray(result.snapshot_years) && result.snapshot_years.length > 0) {
      const latestYear = Math.max(...result.snapshot_years);
      return this.router.createUrlTree(['/result', resultCode, 'general-information'], { 
        queryParams: { version: latestYear } 
      }).toString();
    }
    return `/result/${resultCode}`;
  }

  getResultRouteArray(result: Result): string | string[] {
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
    if (result.platform_code === 'PRMS') {
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
    this.lastClickedElement = target;
    const rowEl = target.closest('tr');
    if (!rowEl) return;
    const tbody = rowEl.parentElement;
    if (!tbody) return;
    const rows = Array.from(tbody.children).filter(el => el.tagName.toLowerCase() === 'tr');
    const rowIndex = rows.indexOf(rowEl);
    if (rowIndex < 0) return;
    const data: Result[] = (this.dt2.filteredValue as Result[] | undefined) ?? this.resultsCenterService.list();
    const pageStart: number = this.dt2.first || 0;
    const idx = pageStart + rowIndex;
    const result = data[idx] as Result | undefined;
    if (result && result.platform_code === 'PRMS') {
      event.preventDefault();
      event.stopPropagation();
      this.allModalsService.selectedResultForInfo.set(result);
      this.allModalsService.openModal('resultInformation');
    }
  }
}
