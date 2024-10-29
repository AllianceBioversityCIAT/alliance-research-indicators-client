import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

interface Option {
  name: string;
}

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [ButtonModule, DropdownModule, FormsModule],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.scss'
})
export default class PartnersComponent implements OnInit {
  options: Option[] | undefined;

  selectedOption: Option | undefined;

  ngOnInit() {
    this.options = [{ name: 'Option 1' }, { name: 'Option 2' }, { name: 'Option 3' }, { name: 'Option 4' }];
  }
}
