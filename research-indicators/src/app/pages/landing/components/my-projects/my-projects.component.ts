import { Component, inject } from '@angular/core';
import { LandingTextsService } from '../../services/landing-texts.service';

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [],
  templateUrl: './my-projects.component.html',
  styleUrl: './my-projects.component.scss'
})
export class MyProjectsComponent {
  cardList = inject(LandingTextsService).cardList;
}
