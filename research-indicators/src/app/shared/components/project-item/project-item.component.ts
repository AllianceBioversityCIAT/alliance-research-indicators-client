import { Component, Input, OnInit } from '@angular/core';
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
export class ProjectItemComponent implements OnInit {
  @Input() isHeader = false;
  @Input() project: GetContractsByUser | GetProjectDetail = {};

  ngOnInit(): void {
    this.project.indicators = this.project.indicators
      ?.map(indicator => ({
        ...indicator,
        indicator_id: indicator.indicator.indicator_id
      }))
      .sort((a, b) => a.indicator_id - b.indicator_id);
  }
}
