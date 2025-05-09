import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import GeographicScopeComponent from './geographic-scope.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('GeographicScopeComponent', () => {
  let component: GeographicScopeComponent;
  let fixture: ComponentFixture<GeographicScopeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeographicScopeComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ version: '1.0' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GeographicScopeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
