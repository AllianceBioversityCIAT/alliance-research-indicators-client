import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MyLatestResultsComponent } from './my-latest-results.component';
import { CacheService } from '@shared/services/cache/cache.service';
import { ApiService } from '../../../../../../shared/services/api.service';
import { ToPromiseService } from '../../../../../../shared/services/to-promise.service';

describe('MyLatestResultsComponent', () => {
  let component: MyLatestResultsComponent;
  let fixture: ComponentFixture<MyLatestResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyLatestResultsComponent, HttpClientTestingModule],
      providers: [ApiService, ToPromiseService, CacheService]
    }).compileComponents();

    fixture = TestBed.createComponent(MyLatestResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
