import { Component, inject } from '@angular/core';
import { GetResultsService } from '../../../services/control-list/get-results.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-results-list-dropdown',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './results-list-dropdown.component.html',
  styleUrl: './results-list-dropdown.component.scss'
})
export class ResultsListDropdownComponent {
  getResultsSE = inject(GetResultsService);
}
