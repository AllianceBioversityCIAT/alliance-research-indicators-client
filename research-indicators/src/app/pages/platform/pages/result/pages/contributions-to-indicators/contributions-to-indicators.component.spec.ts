import { ComponentFixture, TestBed } from '@angular/core/testing';
import ContributionsToIndicatorsComponent from './contributions-to-indicators.component';
import {
  cacheServiceMock,
  submissionServiceMock
} from 'src/app/testing/mock-services.mock';

const versionWatcherServiceMock = {
  onVersionChange: jest.fn()
};

import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '@shared/services/submission.service';
import { VersionWatcherService } from '@shared/services/version-watcher.service';

describe('ContributionsToIndicatorsComponent', () => {
  let component: ContributionsToIndicatorsComponent;
  let fixture: ComponentFixture<ContributionsToIndicatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContributionsToIndicatorsComponent],
      providers: [
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: SubmissionService, useValue: submissionServiceMock },
        { provide: VersionWatcherService, useValue: versionWatcherServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContributionsToIndicatorsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
