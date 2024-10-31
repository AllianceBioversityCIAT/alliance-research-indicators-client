import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';

interface Countries {
  name: string;
  code: string;
}

interface Trainee {
  name: string;
}

interface Supervisor {
  name: string;
}

interface Language {
  name: string;
}

@Component({
  selector: 'app-capacity-sharing',
  standalone: true,
  imports: [ButtonModule, FormsModule, DropdownModule, CalendarModule],
  templateUrl: './capacity-sharing.component.html',
  styleUrl: './capacity-sharing.component.scss'
})
export default class CapacitySharingComponent implements OnInit {
  countries: Countries[] = [];
  trainees: Trainee[] = [];
  supervisors: Supervisor[] = [];
  lenguages: Language[] = [];
  startDate: Date | undefined;
  endDate: Date | undefined;

  selectedCountry: string | undefined;
  selectedTrainee: string | undefined;
  selectedSupervisor: string | undefined;
  selectedLanguage: string | undefined;

  ngOnInit() {
    this.countries = [
      { name: 'Australia', code: 'AU' },
      { name: 'Brazil', code: 'BR' },
      { name: 'China', code: 'CN' },
      { name: 'Egypt', code: 'EG' },
      { name: 'France', code: 'FR' },
      { name: 'Germany', code: 'DE' },
      { name: 'India', code: 'IN' },
      { name: 'Japan', code: 'JP' },
      { name: 'Spain', code: 'ES' },
      { name: 'United States', code: 'US' }
    ];

    this.trainees = [{ name: 'American Anthropological Association' }, { name: 'Archives of American Art' }, { name: 'American Academy of Audiology' }, { name: 'American Academy of Audiology' }, { name: 'American Arbitration Association' }];

    this.supervisors = [{ name: 'AEmeka Okafor' }, { name: 'Fatima Ben Ahmed' }, { name: 'Katarzyna Nowak' }, { name: 'Luca Rossi' }, { name: 'Sophie Dubois ' }];

    this.lenguages = [{ name: 'English' }, { name: 'Spanish' }, { name: 'French' }, { name: 'German' }, { name: 'Italian' }];
  }
}
