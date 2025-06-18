import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import ResultComponent from './result.component';
import { cacheServiceMock } from 'src/app/testing/mock-services.mock';

// Mock de servicios usados en el constructor
const metadataMock = { update: jest.fn() };
const versionWatcherMock = { version: jest.fn().mockReturnValue('1.0') };

describe('ResultComponent', () => {
  let component: ResultComponent;
  let fixture: ComponentFixture<ResultComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, ResultComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { id: '123' },
              paramMap: {
                get: (key: string) => (key === 'id' ? '123' : null)
              }
            },
            params: of({ id: '123' }),
            queryParams: of({ version: '1.0' })
          }
        },
        { provide: 'CacheService', useValue: cacheServiceMock },
        { provide: 'GetMetadataService', useValue: metadataMock },
        { provide: 'VersionWatcherService', useValue: versionWatcherMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
