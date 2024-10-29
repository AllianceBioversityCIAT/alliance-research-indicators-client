import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-result-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './result-sidebar.component.html',
  styleUrl: './result-sidebar.component.scss'
})
export class ResultSidebarComponent {}
