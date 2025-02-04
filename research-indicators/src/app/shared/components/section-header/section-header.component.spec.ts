import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionHeaderComponent } from './section-header.component';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { of } from 'rxjs';
import { CacheService } from '@services/cache/cache.service';

describe('SectionHeaderComponent', () => {
  let component: SectionHeaderComponent;
  let fixture: ComponentFixture<SectionHeaderComponent>;
  let routerSpy: Partial<Router>;

  beforeEach(async () => {
    routerSpy = {
      url: '/test',
      events: of(new NavigationEnd(1, '/test', '/test')),
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [SectionHeaderComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            firstChild: null,
            snapshot: {
              paramMap: new Map(),
              data: { title: 'Test Title' },
              url: [],
              params: {}
            },
            params: of({})
          }
        },
        {
          provide: Router,
          useValue: routerSpy
        },
        {
          provide: CacheService,
          useValue: {
            dataCache: () => ({
              user: { first_name: 'Test User' }
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SectionHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
