import { Component, Input, OnInit, signal } from '@angular/core';
import { PatchPartners } from '@shared/interfaces/patch-partners.interface';
import { ButtonModule } from 'primeng/button';
import { OrderListModule } from 'primeng/orderlist';

interface Product {
  name: string;
}

@Component({
  selector: 'app-table-configuration',
  standalone: true,
  imports: [ButtonModule, OrderListModule],
  templateUrl: './table-configuration.component.html',
  styleUrl: './table-configuration.component.scss'
})
export class TableConfigurationComponent {
  products!: Product[];

  product = signal<Product[]>([
    { name: 'Code' },
    { name: 'Title' },
    { name: 'Indicator' },
    { name: 'Status' },
    { name: 'Project' },
    { name: 'Lever' },
    { name: 'Year' },
    { name: 'Creator' },
    { name: 'Creation date' }
  ]);

  @Input() hideSidebar = true;

  body = signal<PatchPartners>(new PatchPartners());

  toggleSidebar() {
    this.hideSidebar = !this.hideSidebar;
  }

  hideSidebarMethod() {
    this.hideSidebar = true;
  }
}
