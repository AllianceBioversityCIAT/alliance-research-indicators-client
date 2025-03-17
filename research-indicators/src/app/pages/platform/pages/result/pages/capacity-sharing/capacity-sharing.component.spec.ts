import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import CapacitySharingComponent from './capacity-sharing.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';

describe('CapacitySharingComponent', () => {
  let component: CapacitySharingComponent;
  let fixture: ComponentFixture<CapacitySharingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapacitySharingComponent, HttpClientTestingModule],
      providers: [ApiService, ActionsService, CacheService]
    }).compileComponents();

    fixture = TestBed.createComponent(CapacitySharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
