import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllianceNavbarComponent } from './alliance-navbar.component';
import { CacheService } from '@services/cache/cache.service';
import { DarkModeService } from '@services/dark-mode.service';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { signal } from '@angular/core';

describe('AllianceNavbarComponent', () => {
  let component: AllianceNavbarComponent;
  let fixture: ComponentFixture<AllianceNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllianceNavbarComponent, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: CacheService,
          useValue: {
            dataCache: signal({}),
            isLoggedIn: { set: jest.fn() }
          }
        },
        {
          provide: DarkModeService,
          useValue: {
            isDarkModeEnabled: () => false,
            toggleDarkMode: jest.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AllianceNavbarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
