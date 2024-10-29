import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-evidence',
  standalone: true,
  imports: [ButtonModule, InputTextareaModule, FormsModule, InputTextModule],
  templateUrl: './evidence.component.html',
  styleUrl: './evidence.component.scss'
})
export default class EvidenceComponent {
  value: undefined;
}
