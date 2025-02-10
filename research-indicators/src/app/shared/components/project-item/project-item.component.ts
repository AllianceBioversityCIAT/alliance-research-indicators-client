import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { GetContractsByUser } from '@shared/interfaces/get-contracts-by-user.interface';
import { GetProjectDetail } from '@shared/interfaces/get-project-detail.interface';

@Component({
  selector: 'app-project-item',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './project-item.component.html',
  styleUrl: './project-item.component.scss'
})
export class ProjectItemComponent {
  @Input() isHeader = false;
  @Input() project: GetContractsByUser | GetProjectDetail = {};
}
