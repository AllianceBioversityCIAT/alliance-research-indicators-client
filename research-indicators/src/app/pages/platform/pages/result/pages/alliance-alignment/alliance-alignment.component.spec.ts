import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import AllianceAlignmentComponent from './alliance-alignment.component';

describe('AllianceAlignmentComponent', () => {
  let component: AllianceAlignmentComponent;
  let fixture: ComponentFixture<AllianceAlignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllianceAlignmentComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AllianceAlignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
