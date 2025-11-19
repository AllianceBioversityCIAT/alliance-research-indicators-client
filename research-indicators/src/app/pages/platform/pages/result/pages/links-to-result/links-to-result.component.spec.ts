import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import LinksToResultComponent from './links-to-result.component';
import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '@shared/services/submission.service';

describe('LinksToResultComponent', () => {
  let component: LinksToResultComponent;
  let fixture: ComponentFixture<LinksToResultComponent>;
  let router: jest.Mocked<Router>;
  let cache: jest.Mocked<CacheService>;

  beforeEach(async () => {
    router = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    cache = {
      currentResultId: jest.fn().mockReturnValue('123'),
      showSectionHeaderActions: jest.fn().mockReturnValue(false),
      currentMetadata: jest.fn().mockReturnValue({ result_title: 'Mock Result' }),
      isSidebarCollapsed: jest.fn().mockReturnValue(false)
    } as unknown as jest.Mocked<CacheService>;

    await TestBed.configureTestingModule({
      imports: [LinksToResultComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: CacheService, useValue: cache },
        {
          provide: SubmissionService,
          useValue: {
            isEditableStatus: jest.fn().mockReturnValue(true)
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: jest.fn().mockReturnValue('1.0')
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LinksToResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back to general information', () => {
    router.navigate.mockClear();
    component.navigate('back');
    expect(router.navigate).toHaveBeenCalledWith(['result', '123', 'geographic-scope'], { queryParams: { version: '1.0' }, replaceUrl: true });
  });

  it('should navigate next to alliance alignment', () => {
    router.navigate.mockClear();
    component.navigate('next');
    expect(router.navigate).toHaveBeenCalledWith(['result', '123', 'evidence'], { queryParams: { version: '1.0' }, replaceUrl: true });
  });
});

