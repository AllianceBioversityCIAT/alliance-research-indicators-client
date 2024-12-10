import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GetProjectDetail } from '../../interfaces/get-project-detail.interface';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-project-item',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './project-item.component.html',
  styleUrl: './project-item.component.scss'
})
export class ProjectItemComponent {
  @Input() isHeader = false;
  @Input() project: GetProjectDetail = {};
}
