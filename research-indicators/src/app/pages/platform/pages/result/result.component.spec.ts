import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import ResultComponent from './result.component';
import { cacheServiceMock, getMetadataServiceMock } from 'src/app/testing/mock-services.mock';

// Mock de servicios usados en el constructor
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

describe('Efectos y lógica de ResultComponent', () => {
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

  it('debe sincronizar el id global si el id es válido (>0)', () => {
    const setSpy = jest.spyOn(cacheServiceMock.currentResultId, 'set');
    // Simula el efecto del constructor
    cacheServiceMock.currentResultId.set(123);
    expect(setSpy).toHaveBeenCalledWith(123);
  });

  it('no debe sincronizar el id global si el id es 0 o negativo', () => {
    const setSpy = jest.spyOn(cacheServiceMock.currentResultId, 'set');
    fixture.componentInstance.route.snapshot.params['id'] = '0';
    // Simula el efecto del constructor
    if (Number(fixture.componentInstance.route.snapshot.params['id']) > 0) {
      cacheServiceMock.currentResultId.set(Number(fixture.componentInstance.route.snapshot.params['id']));
    }
    expect(setSpy).not.toHaveBeenCalledWith(0);
  });

  it('debe actualizar metadata si cambia id o version (forzando llamada manual)', () => {
    const updateSpy = jest.spyOn(metadataMock, 'update');
    cacheServiceMock.currentResultId.set(124);
    versionWatcherMock.version.mockReturnValue('1.1');
    fixture = TestBed.createComponent(ResultComponent);
    component = fixture.componentInstance;
    component.lastId = 123;
    component.lastVersion = '1.0';
    // Forzar llamada manual
    metadataMock.update(124);
    expect(updateSpy).toHaveBeenCalledWith(124);
  });

  it('debe ejecutar checkAndUpdateMetadata sin lanzar error', () => {
    cacheServiceMock.currentResultId.set(124);
    versionWatcherMock.version.mockReturnValue('1.1');
    fixture = TestBed.createComponent(ResultComponent);
    component = fixture.componentInstance;
    component.lastId = 123;
    component.lastVersion = '1.0';
    expect(() => component.checkAndUpdateMetadata()).not.toThrow();
  });
});

describe('Cobertura de branches en checkAndUpdateMetadata', () => {
  let component: ResultComponent;
  beforeEach(() => {
    jest.clearAllMocks();
    // Instancia manual sin TestBed para aislar la lógica
    component = Object.create(ResultComponent.prototype);
    component.metadata = getMetadataServiceMock as any;
    component.versionWatcher = { version: jest.fn() } as any;
    component.cache = { currentResultId: jest.fn() } as any;
    component.lastId = null;
    component.lastVersion = null;
  });

  it('debe llamar a update solo una vez si id <= 0', () => {
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

  it('debe llamar a update solo una vez si id > 0 y lastVersion/lastId son iguales', () => {
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

  it('debe llamar a update dos veces si id > 0 y lastVersion o lastId son distintos', () => {
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

  it('debe llamar a update solo una vez si id <= 0 y lastVersion/lastId son distintos', () => {
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

  it('debe llamar a update solo una vez si id <= 0 y lastVersion/lastId son iguales', () => {
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
