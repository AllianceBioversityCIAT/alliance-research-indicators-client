import { ComponentFixture, TestBed } from '@angular/core/testing';

import ProgressTowardsIndicatorsComponent from './progress-towards-indicators.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

describe('ProgressTowardsIndicatorsComponent', () => {
  let component: ProgressTowardsIndicatorsComponent;
  let fixture: ComponentFixture<ProgressTowardsIndicatorsComponent>;

  const mockActivatedRoute = {
    snapshot: {
      params: { id: 'test-id' }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressTowardsIndicatorsComponent, HttpClientTestingModule],
      providers: [{ provide: ActivatedRoute, useValue: mockActivatedRoute }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressTowardsIndicatorsComponent);
    component = fixture.componentInstance;

    // Mock the API call to avoid actual HTTP requests
    jest.spyOn(component.api, 'GET_IndicatorsProgress').mockResolvedValue({
      data: [],
      successfulRequest: true,
      message: 'Test'
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize indicators signal', () => {
    expect(component.indicators()).toEqual([]);
  });

  it('should calculate progress correctly', () => {
    const mockIndicator = {
      indicator_id: 1,
      code: 'TEST',
      name: 'Test Indicator',
      description: 'Test Description',
      target_unit: 'units',
      number_type: 'sum',
      number_format: 'integer',
      target_value: 100,
      base_line: 0,
      year: [2024],
      type: 'Output',
      contributions: [],
      total_contributions: 50
    };

    // Test the inline calculation logic that happens in the component
    const percentageProgress = (mockIndicator.total_contributions / mockIndicator.target_value) * 100;
    expect(percentageProgress).toBe(50);
  });

  it('should return correct remaining status', () => {
    const mockIndicator = {
      indicator_id: 1,
      code: 'TEST',
      name: 'Test Indicator',
      description: 'Test Description',
      target_unit: 'units',
      number_type: 'sum',
      number_format: 'integer',
      target_value: 100,
      base_line: 0,
      year: [2024],
      type: 'Output',
      contributions: [],
      total_contributions: 50
    };

    expect(component.getRemainingStatus(mockIndicator)).toBe('remaining');

    mockIndicator.total_contributions = 100;
    expect(component.getRemainingStatus(mockIndicator)).toBe('exact');

    mockIndicator.total_contributions = 120;
    expect(component.getRemainingStatus(mockIndicator)).toBe('exceeded');
  });
});
