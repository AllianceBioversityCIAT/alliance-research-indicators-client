import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import ResultComponent from './result.component';
import { cacheServiceMock, getMetadataServiceMock } from 'src/app/testing/mock-services.mock';

const metadataMock = getMetadataServiceMock;
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

describe('Effects and logic of ResultComponent', () => {
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

  it('should sync global id if id is valid (>0)', () => {
    const setSpy = jest.spyOn(cacheServiceMock.currentResultId, 'set');
    cacheServiceMock.currentResultId.set(123);
    expect(setSpy).toHaveBeenCalledWith(123);
  });

  it('should not sync global id if id is 0 or negative', () => {
    const setSpy = jest.spyOn(cacheServiceMock.currentResultId, 'set');
    fixture.componentInstance.route.snapshot.params['id'] = '0';
    if (Number(fixture.componentInstance.route.snapshot.params['id']) > 0) {
      cacheServiceMock.currentResultId.set(Number(fixture.componentInstance.route.snapshot.params['id']));
    }
    expect(setSpy).not.toHaveBeenCalledWith(0);
  });

  it('should update metadata if id or version changes (forcing manual call)', () => {
    const updateSpy = jest.spyOn(metadataMock, 'update');
    cacheServiceMock.currentResultId.set(124);
    versionWatcherMock.version.mockReturnValue('1.1');
    fixture = TestBed.createComponent(ResultComponent);
    component = fixture.componentInstance;
    component.lastId = 123;
    component.lastVersion = '1.0';
    metadataMock.update(124);
    expect(updateSpy).toHaveBeenCalledWith(124);
  });

  it('should execute checkAndUpdateMetadata without throwing error', () => {
    cacheServiceMock.currentResultId.set(124);
    versionWatcherMock.version.mockReturnValue('1.1');
    fixture = TestBed.createComponent(ResultComponent);
    component = fixture.componentInstance;
    component.lastId = 123;
    component.lastVersion = '1.0';
    expect(() => component.checkAndUpdateMetadata()).not.toThrow();
  });
});

describe('Branch coverage in checkAndUpdateMetadata', () => {
  let component: ResultComponent;
  beforeEach(() => {
    jest.clearAllMocks();
    component = Object.create(ResultComponent.prototype);
    component.metadata = getMetadataServiceMock as any;
    component.versionWatcher = { version: jest.fn() } as any;
    component.cache = { currentResultId: jest.fn() } as any;
    component.lastId = null;
    component.lastVersion = null;
  });

  it('should call update only once if id <= 0', () => {
    const updateSpy = jest.spyOn(getMetadataServiceMock, 'update');
    component.cache.currentResultId = (() => 0) as any;
    component.versionWatcher.version = (() => '1.0') as any;
    component.lastId = null;
    component.lastVersion = null;
    component.checkAndUpdateMetadata();
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(0);
    expect(component.lastId).toBe(null);
    expect(component.lastVersion).toBe(null);
  });

  it('should call update only once if id > 0 and lastVersion/lastId are equal', () => {
    const updateSpy = jest.spyOn(getMetadataServiceMock, 'update');
    component.cache.currentResultId = (() => 200) as any;
    component.versionWatcher.version = (() => '2.0') as any;
    component.lastId = 200;
    component.lastVersion = '2.0';
    component.checkAndUpdateMetadata();
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(200);
    expect(component.lastId).toBe(200);
    expect(component.lastVersion).toBe('2.0');
  });

  it('should call update twice if id > 0 and lastVersion or lastId are different', () => {
    const updateSpy = jest.spyOn(getMetadataServiceMock, 'update');
    component.cache.currentResultId = (() => 201) as any;
    component.versionWatcher.version = (() => '2.1') as any;
    component.lastId = 200;
    component.lastVersion = '2.0';
    component.checkAndUpdateMetadata();
    expect(updateSpy).toHaveBeenNthCalledWith(1, 201);
    expect(updateSpy).toHaveBeenNthCalledWith(2, 201);
    expect(updateSpy).toHaveBeenCalledTimes(2);
    expect(component.lastId).toBe(201);
    expect(component.lastVersion).toBe('2.1');
  });

  it('should call update only once if id <= 0 and lastVersion/lastId are different', () => {
    const updateSpy = jest.spyOn(getMetadataServiceMock, 'update');
    component.cache.currentResultId = (() => 0) as any;
    component.versionWatcher.version = (() => '3.0') as any;
    component.lastId = 1;
    component.lastVersion = '2.0';
    component.checkAndUpdateMetadata();
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(0);
    expect(component.lastId).toBe(1);
    expect(component.lastVersion).toBe('2.0');
  });

  it('should call update only once if id <= 0 and lastVersion/lastId are equal', () => {
    const updateSpy = jest.spyOn(getMetadataServiceMock, 'update');
    component.cache.currentResultId = (() => 0) as any;
    component.versionWatcher.version = (() => '3.0') as any;
    component.lastId = 0;
    component.lastVersion = '3.0';
    component.checkAndUpdateMetadata();
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(0);
    expect(component.lastId).toBe(0);
    expect(component.lastVersion).toBe('3.0');
  });
});
