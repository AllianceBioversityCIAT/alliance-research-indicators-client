import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import PolicyChangeComponent from './policy-change.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('PolicyChangeComponent', () => {
  let component: PolicyChangeComponent;
  let fixture: ComponentFixture<PolicyChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyChangeComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ version: '1.0' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
