import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main-actions',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './main-actions.component.html',
  styleUrl: './main-actions.component.scss'
})
export class MainActionsComponent {}
