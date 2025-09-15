import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ManageLevelsModalComponent } from './manage-levels-modal.component';

describe('ManageLevelsModalComponent', () => {
  let component: ManageLevelsModalComponent;
  let fixture: ComponentFixture<ManageLevelsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageLevelsModalComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageLevelsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
