import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import ContributionsToIndicatorsComponent from './contributions-to-indicators.component';
import { cacheServiceMock, submissionServiceMock, apiServiceMock, httpClientMock } from 'src/app/testing/mock-services.mock';

const versionWatcherServiceMock = {
  onVersionChange: jest.fn()
};

const extendedApiServiceMock = {
  ...apiServiceMock,
  GET_Alignments: jest.fn().mockResolvedValue({
    data: {
      contracts: [
        { contract_id: 'TEST-001', name: 'Test Contract 1' },
        { contract_id: 'TEST-002', name: 'Test Contract 2' }
      ]
    }
  }),
  GET_Indicators: jest.fn().mockResolvedValue({
    data: [
      { id: 1, name: 'Test Indicator 1' },
      { id: 2, name: 'Test Indicator 2' }
    ]
  })
};

import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '@shared/services/submission.service';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { ApiService } from '@shared/services/api.service';

describe('ContributionsToIndicatorsComponent', () => {
  let component: ContributionsToIndicatorsComponent;
  let fixture: ComponentFixture<ContributionsToIndicatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContributionsToIndicatorsComponent],
      providers: [
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: SubmissionService, useValue: submissionServiceMock },
        { provide: VersionWatcherService, useValue: versionWatcherServiceMock },
        { provide: ApiService, useValue: extendedApiServiceMock },
        { provide: HttpClient, useValue: httpClientMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContributionsToIndicatorsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
