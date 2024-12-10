import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { MainActionsComponent } from './components/main-actions/main-actions.component';
import { DataOverviewComponent } from './components/data-overview/data-overview.component';
import { MyLatestResultsComponent } from './components/my-latest-results/my-latest-results.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, MainActionsComponent, DataOverviewComponent, MyLatestResultsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export default class HomeComponent {}
