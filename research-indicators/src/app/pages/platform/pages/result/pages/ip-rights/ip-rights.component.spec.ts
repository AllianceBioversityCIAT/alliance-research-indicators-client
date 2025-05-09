import { ComponentFixture, TestBed } from '@angular/core/testing';
import IpRightsComponent from './ip-rights.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('IpRightsComponent', () => {
  let component: IpRightsComponent;
  let fixture: ComponentFixture<IpRightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpRightsComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ version: '1.0' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IpRightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
