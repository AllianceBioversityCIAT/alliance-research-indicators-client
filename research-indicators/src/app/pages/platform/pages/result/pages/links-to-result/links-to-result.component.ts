import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';
import { S3ImageUrlPipe } from '@shared/pipes/s3-image-url.pipe';
import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '@shared/services/submission.service';
import { AllModalsService } from '@shared/services/cache/all-modals.service';

@Component({
  selector: 'app-links-to-result',
  imports: [FormHeaderComponent, NavigationButtonsComponent, S3ImageUrlPipe ],
  templateUrl: './links-to-result.component.html'
})
export default class LinksToResultComponent {
  private router = inject(Router);
  private cache = inject(CacheService);
  private route = inject(ActivatedRoute);
  submission = inject(SubmissionService);
  allModalsService = inject(AllModalsService);

  navigate(page?: 'next' | 'back'): void {
    const version = this.route.snapshot.queryParamMap.get('version');
    const queryParams = version ? { version } : undefined;

    if (page === 'back') {
      this.router.navigate(['result', this.cache.currentResultId(), 'geographic-scope'], {
        queryParams,
        replaceUrl: true
      });
      return;
    }

    if (page === 'next') {
      this.router.navigate(['result', this.cache.currentResultId(), 'evidence'], {
        queryParams,
        replaceUrl: true
      });
    }
  }

  openSearchLinkedResults(): void {
    this.allModalsService.openModal('selectLinkedResults');
  }
}

