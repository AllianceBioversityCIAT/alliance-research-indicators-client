import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { SubmissionHistoryItemComponent } from './submission-history-item.component';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '@shared/services/submission.service';
import { ActionsService } from '@shared/services/actions.service';
import { SubmissionHistoryItem } from '@shared/interfaces/submission-history-item.interface';

describe('SubmissionHistoryItemComponent', () => {
  let component: SubmissionHistoryItemComponent;
  let fixture: ComponentFixture<SubmissionHistoryItemComponent>;

  beforeEach(async () => {
    const mockApiService: Partial<ApiService> = {
      PATCH_StatusChangeDate: jest.fn().mockResolvedValue({ successfulRequest: true })
    };
    const mockCacheService: Partial<CacheService> = {
      currentMetadata: signal({ indicator_id: 1 }),
      editStatusDateOpenId: signal<number | null>(null),
      getCurrentNumericResultId: () => 12345
    };
    const mockSubmissionService: Partial<SubmissionService> = {
      refreshSubmissionHistory: signal(0)
    };
    const mockActionsService: Partial<ActionsService> = {
      showToast: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [SubmissionHistoryItemComponent],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: SubmissionService, useValue: mockSubmissionService },
        { provide: ActionsService, useValue: mockActionsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmissionHistoryItemComponent);
    component = fixture.componentInstance;
    component.historyItem = {
      created_by_object: { first_name: 'Test', last_name: 'User' },
      from_status_id: 1,
      to_status_id: 2,
      from_status: { name: 'A', config: { color: {}, icon: {} } } as any,
      to_status: { name: 'B', config: { color: {}, icon: {} } } as any,
      updated_at: '2026-02-02T12:00:00.000Z'
    } as SubmissionHistoryItem;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
