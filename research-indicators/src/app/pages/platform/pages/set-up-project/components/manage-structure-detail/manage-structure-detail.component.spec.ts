import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ManageStructureDetailComponent } from './manage-structure-detail.component';

describe('ManageStructureDetailComponent', () => {
  let component: ManageStructureDetailComponent;
  let fixture: ComponentFixture<ManageStructureDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageStructureDetailComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageStructureDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
