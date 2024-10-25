import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

interface Option {
  name: string;
}

@Component({
  selector: 'app-general-information',
  standalone: true,
  imports: [DialogModule, ButtonModule, FormsModule, InputTextModule, DropdownModule, InputTextareaModule],
  templateUrl: './general-information.component.html',
  styleUrl: './general-information.component.scss'
})
export default class GeneralInformationComponent implements OnInit {
  value: undefined;
  options: Option[] | undefined;

  selectedOption: Option | undefined;

  ngOnInit() {
    this.options = [{ name: 'Option 1' }, { name: 'Option 2' }, { name: 'Option 3' }, { name: 'Option 4' }];
  }
}
