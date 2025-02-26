import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionHeaderComponent } from './section-header.component';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { of } from 'rxjs';
import { CacheService } from '@services/cache/cache.service';
import { signal } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

describe('SectionHeaderComponent', () => {
  let component: SectionHeaderComponent;
  let fixture: ComponentFixture<SectionHeaderComponent>;
  let routerSpy: Partial<Router>;
  let cacheService: Partial<CacheService>;

  beforeEach(async () => {
    routerSpy = {
      url: '/test',
      events: of(new NavigationEnd(1, '/test', '/test')),
      navigate: jest.fn()
    };

    cacheService = {
      dataCache: signal({
        user: {
          first_name: 'Test User',
          last_name: 'User',
          is_active: true,
          sec_user_id: 1,
          roleName: 'Admin',
          email: 'testuser@example.com',
          status_id: 1,
          user_role_list: [
            {
              roleName: 'Admin',
              roleId: 1,
              is_active: true,
              user_id: 1,
              role_id: 1,
              role: 'Admin'
            }
          ]
          // Agregar otras propiedades necesarias aquí
        },
        access_token: 'dummy_access_token',
        refresh_token: 'dummy_refresh_token',
        exp: 0
      }),
      headerHeight: signal<number>(0),
      navbarHeight: signal<number>(0),
      hasSmallScreen: signal<boolean>(true)
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, SectionHeaderComponent],
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
          useValue: cacheService
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
