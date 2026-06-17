import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ProjectDashboardComponent } from './project-dashboard.component';
import { GetTopContributorsContractsService } from '@services/get-top-contributors-contracts.service';
import { GetTopPartnersService } from '@services/get-top-partners.service';
import { GetTopPrimaryLeversService } from '@services/get-top-primary-levers.service';
import { GetGeoScopeService } from '@services/get-geo-scope.service';
import { ApiService } from '@shared/services/api.service';

describe('ProjectDashboardComponent', () => {
  let component: ProjectDashboardComponent;
  let fixture: ComponentFixture<ProjectDashboardComponent>;
  let topContributors: { main: jest.Mock };
  let topPartners: { main: jest.Mock };
  let topPrimaryLevers: { main: jest.Mock };
  let geoScope: { main: jest.Mock };
  let api: { GET_ResultsCount: jest.Mock };

  beforeEach(async () => {
    topContributors = { main: jest.fn(), list: signal([]), loading: signal(false), loadError: signal(false), update: jest.fn() };
    topPartners = { main: jest.fn(), list: signal([]), loading: signal(false), loadError: signal(false), update: jest.fn() };
    topPrimaryLevers = { main: jest.fn(), list: signal([]), loading: signal(false), loadError: signal(false), update: jest.fn() };
    geoScope = {
      main: jest.fn(),
      summary: signal({}),
      topRegionsList: signal([]),
      topCountries: signal([]),
      loading: signal(false),
      loadError: signal(false),
      update: jest.fn()
    };
    api = { GET_ResultsCount: jest.fn().mockResolvedValue({ data: { agreement_id: 'A100' } }) };

    await TestBed.configureTestingModule({
      imports: [ProjectDashboardComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: { snapshot: { paramMap: { get: (key: string) => (key === 'id' ? 'A100' : null) } } }
          }
        },
        { provide: ApiService, useValue: api },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
      .overrideComponent(ProjectDashboardComponent, {
        set: {
          providers: [
            { provide: GetTopContributorsContractsService, useValue: topContributors },
            { provide: GetTopPartnersService, useValue: topPartners },
            { provide: GetTopPrimaryLeversService, useValue: topPrimaryLevers },
            { provide: GetGeoScopeService, useValue: geoScope }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load dashboard data for the contract id', async () => {
    expect(component).toBeTruthy();
    expect(topContributors.main).toHaveBeenCalledWith('A100', 3);
    expect(topPartners.main).toHaveBeenCalledWith('A100', 5);
    expect(topPrimaryLevers.main).toHaveBeenCalledWith('A100', 5);
    expect(geoScope.main).toHaveBeenCalledWith('A100');
    await Promise.resolve();
    expect(api.GET_ResultsCount).toHaveBeenCalledWith('A100');
  });
});
