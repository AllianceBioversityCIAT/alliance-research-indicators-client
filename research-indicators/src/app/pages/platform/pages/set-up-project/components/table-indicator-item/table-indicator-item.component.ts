import { Component, Input, OnInit } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-table-indicator-item',
  imports: [TagModule],
  templateUrl: './table-indicator-item.component.html',
  styleUrl: './table-indicator-item.component.scss'
})
export class TableIndicatorItemComponent implements OnInit {
  @Input() indicators: any[] = [];
  ngOnInit(): void {
    console.log(this.indicators);
  }
}
