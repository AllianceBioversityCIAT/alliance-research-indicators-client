import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TableConfigurationComponent } from './table-configuration.component';
import { ResultsCenterService } from '../../results-center.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { GetResultsService } from '../../../../../../shared/services/control-list/get-results.service';

describe('TableConfigurationComponent', () => {
  let component: TableConfigurationComponent;
  let fixture: ComponentFixture<TableConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableConfigurationComponent, HttpClientTestingModule],
      providers: [ResultsCenterService, CacheService, GetResultsService]
    }).compileComponents();

    fixture = TestBed.createComponent(TableConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
