import { Component, effect, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ResultsCenterService } from '../../results-center.service';
import * as ExcelJS from 'exceljs';
import { Router } from '@angular/router';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';

@Component({
  selector: 'app-results-center-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, MenuModule],
  templateUrl: './results-center-table.component.html',
  styleUrls: ['./results-center-table.component.scss']
})
export class ResultsCenterTableComponent {
  resultsCenterService = inject(ResultsCenterService);
  private router = inject(Router);
  private cacheService = inject(CacheService);
  @ViewChild('dt2') dt2!: Table;

  menuItems: MenuItem[] = [
    { label: 'Edit', icon: 'pi pi-pencil' },
    { label: 'Delete', icon: 'pi pi-trash' },
    { label: 'Export', icon: 'pi pi-download' }
  ];

  onSearchInputChange = effect(() => {
    this.dt2.filterGlobal(this.resultsCenterService.searchInput(), 'contains');
  });

  setSearchInputFilter($event: Event) {
    this.resultsCenterService.searchInput.set(($event.target as HTMLInputElement).value);
  }

  private adjustColumnWidth(worksheet: ExcelJS.Worksheet, columnNumber: number, maxWidth = 70, minWidth = 15) {
    const column = worksheet.getColumn(columnNumber);
    if (column) {
      // Initialize maxLength with header length
      let maxLength = column.header?.toString().length || 0;

      // Check all cell contents
      column.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber > 1) {
          // Skip header since we already considered it
          const cellText = cell.text || '';
          const textLength = cellText.toString().length;
          maxLength = Math.max(maxLength, textLength);
        }
      });

      column.width = Math.min(Math.max(maxLength + 2, minWidth), maxWidth);
    }
  }

  private styleHeaderColumns(worksheet: ExcelJS.Worksheet, totalColumns: number) {
    // Style each header cell and hide unused columns

    // Set print area and view to only show used columns
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
      (this.dt2.filteredValue || this.resultsCenterService.list())?.map(result => ({
        Code: result.result_official_code,
        Title: result.title,
        // Description: result.description?.substring(0, 200) || '',
        Indicator: result.indicators?.name || '',
        Status: result.result_status?.name || '',
        Project: result.result_contracts?.contract_id || '',
        Lever: result.result_levers?.lever?.short_name || '',
        Year: result.report_year_id || '',
        Creator: result.created_by_user ? `${result.created_by_user.first_name} ${result.created_by_user.last_name}` : '',
        'Creation date': result.created_at ? new Date(result.created_at).toLocaleDateString() : ''
      })) || [];

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

  getIndicatorName(id: number): string {
    // TODO: Implement indicator name mapping
    return `Indicator ${id}`;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | undefined {
    const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      SUBMITTED: 'info',
      ACCEPTED: 'success',
      EDITING: 'warning'
    };
    return severityMap[status];
  }

  openResult(resultId: string) {
    this.router.navigate(['/result', resultId]);
  }
}
