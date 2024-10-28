import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ResultSidebarComponent } from '../../../../shared/components/result-sidebar/result-sidebar.component';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [RouterOutlet, ResultSidebarComponent],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export default class ResultComponent {}
