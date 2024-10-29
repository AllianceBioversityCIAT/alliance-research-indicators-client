import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';

interface Organizations {
  name: string;
}

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [ButtonModule, FormsModule, MultiSelectModule],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.scss'
})
export default class PartnersComponent implements OnInit {
  organizations!: Organizations[];

  selectedOrganizations!: Organizations[];

  ngOnInit() {
    this.organizations = [{ name: 'WUR - Netherlands' }, { name: 'MARI - Tanzania, United Republic' }, { name: 'INRAB - Benin' }, { name: 'NARO - Uganda' }, { name: 'MARTI - Tanzania' }];
  }
}
