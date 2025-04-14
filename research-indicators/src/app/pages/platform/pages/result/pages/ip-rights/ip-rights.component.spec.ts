import { ComponentFixture, TestBed } from '@angular/core/testing';
import IpRightsComponent from './ip-rights.component';


describe('IpRightsComponent', () => {
  let component: IpRightsComponent;
  let fixture: ComponentFixture<IpRightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpRightsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpRightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
