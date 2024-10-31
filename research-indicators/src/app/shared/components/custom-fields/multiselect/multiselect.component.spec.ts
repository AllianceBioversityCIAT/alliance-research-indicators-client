import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiselectComponent } from './multiselect.component';
import { GetLeversService } from '../../../services/control-list/get-levers.service';
import { signal } from '@angular/core';

describe('MultiselectComponent', () => {
  let component: MultiselectComponent;
  let fixture: ComponentFixture<MultiselectComponent>;
  let mockGetLeversService: Partial<GetLeversService>;

  beforeEach(async () => {
    mockGetLeversService = {
      // Mock the loading method to return a signal
    };

    await TestBed.configureTestingModule({
      imports: [MultiselectComponent],
      providers: [{ provide: GetLeversService, useValue: mockGetLeversService }]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiselectComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
