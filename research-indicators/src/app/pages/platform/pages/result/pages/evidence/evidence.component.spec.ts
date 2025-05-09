import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import EvidenceComponent from './evidence.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('EvidenceComponent', () => {
  let component: EvidenceComponent;
  let fixture: ComponentFixture<EvidenceComponent>;

  beforeEach(async () => {
    const mockApiService = {
      GET_ResultEvidences: jest.fn().mockResolvedValue({ data: {} }),
      PATCH_ResultEvidences: jest.fn().mockResolvedValue({})
    };

    const mockActionsService = {
      saveCurrentSectionValue: jest.fn().mockReturnValue(false),
      showToast: jest.fn()
    };

    const mockCacheService = {
      currentResultId: jest.fn().mockReturnValue('mock-id'),
      currentMetadata: jest.fn().mockReturnValue({
        result_type: 'mock-type',
        title: 'mock-title'
      }),
      showSectionHeaderActions: jest.fn().mockReturnValue(true),
      isSidebarCollapsed: jest.fn().mockReturnValue(false)
    };

    const mockRouter = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [EvidenceComponent, HttpClientTestingModule],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: ActionsService, useValue: mockActionsService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ version: '1.0' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EvidenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
