import { Component, inject } from '@angular/core';
import { LandingTextsService } from '../../services/landing-texts.service';
import { S3ImageUrlPipe } from '@shared/pipes/s3-image-url.pipe';

@Component({
    selector: 'app-my-projects',
    imports: [S3ImageUrlPipe],
    templateUrl: './my-projects.component.html',
    styleUrl: './my-projects.component.scss'
})
export class MyProjectsComponent {
  cardList = inject(LandingTextsService).cardList;
}
