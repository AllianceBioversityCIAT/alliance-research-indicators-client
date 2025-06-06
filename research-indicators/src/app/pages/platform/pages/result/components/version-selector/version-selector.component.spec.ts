import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { VersionSelectorComponent } from './version-selector.component';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { ActivatedRoute, Router } from '@angular/router';
import { routeMock, cacheServiceMock, routerMock } from 'src/app/testing/mock-services';

describe('VersionSelectorComponent', () => {
  let component: VersionSelectorComponent;
  let fixture: ComponentFixture<VersionSelectorComponent>;

  // Mocks
  let apiMock: Partial<ApiService>;

  beforeEach(waitForAsync(() => {
    apiMock = {
      GET_Versions: jest.fn().mockResolvedValue({
        data: {
          live: [],
          versions: []
        }
      })
    };

    TestBed.configureTestingModule({
      imports: [VersionSelectorComponent],
      providers: [
        { provide: ApiService, useValue: apiMock },
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
