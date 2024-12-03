import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeographicScopeComponent } from './geographic-scope.component';

describe('GeographicScopeComponent', () => {
  let component: GeographicScopeComponent;
  let fixture: ComponentFixture<GeographicScopeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeographicScopeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeographicScopeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
