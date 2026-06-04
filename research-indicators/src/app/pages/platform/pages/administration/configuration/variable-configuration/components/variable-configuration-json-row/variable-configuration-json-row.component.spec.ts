import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CacheService } from '@shared/services/cache/cache.service';
import { UtilsService } from '@shared/services/utils.service';
import { WordCountService } from '@shared/services/word-count.service';
import { cacheServiceMock } from 'src/app/testing/mock-services.mock';
import { VariableConfigurationJsonRowComponent } from './variable-configuration-json-row.component';
import { AppConfigListItem } from '@shared/interfaces/app-config.interface';
import { buildJsonEditorTree, flattenJsonLeaves } from '@shared/utils/json-structure-editor.util';

describe('VariableConfigurationJsonRowComponent', () => {
  const jsonValue = { meta: { enabled: true }, locale: 'en-US' };
  const row: AppConfigListItem = {
    key: 'json.key',
    category: 'UI',
    subcategory: null,
    description: null,
    simple_value: null,
    json_value: jsonValue,
    updated_at: '2024-01-01',
    updated_by: 'user'
  };
  const sections = buildJsonEditorTree(jsonValue);
  const values = flattenJsonLeaves(jsonValue);

  let fixture: ComponentFixture<VariableConfigurationJsonRowComponent>;
  let component: VariableConfigurationJsonRowComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariableConfigurationJsonRowComponent, HttpClientTestingModule],
      providers: [
        { provide: CacheService, useValue: cacheServiceMock },
        {
          provide: UtilsService,
          useValue: { getNestedProperty: jest.fn(), setNestedPropertyWithReduceSignal: jest.fn() }
        },
        { provide: WordCountService, useValue: { getWordCount: jest.fn().mockReturnValue(0) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VariableConfigurationJsonRowComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('row', row);
    fixture.componentRef.setInput('sections', sections);
    fixture.componentRef.setInput('values', values);
    fixture.componentRef.setInput('expandedSections', { meta: true });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isSectionExpanded should read expansion map', () => {
    expect(component.isSectionExpanded('meta')).toBe(true);
    expect(component.isSectionExpanded('missing')).toBe(false);
  });

  it('fieldValue should default missing keys to empty string', () => {
    expect(component.fieldValue('locale')).toBe('en-US');
    expect(component.fieldValue('missing')).toBe('');
  });

  it('onStringChange should emit fieldChange', () => {
    const events: unknown[] = [];
    component.fieldChange.subscribe(e => events.push(e));
    component.onStringChange('locale', 'fr-FR');
    expect(events).toEqual([{ pathKey: 'locale', value: 'fr-FR' }]);
  });

  it('onNumberChange should coerce null to zero', () => {
    const events: unknown[] = [];
    component.fieldChange.subscribe(e => events.push(e));
    component.onNumberChange('count', null);
    expect(events).toEqual([{ pathKey: 'count', value: 0 }]);
  });

  it('onBooleanChange should emit boolean values', () => {
    const events: unknown[] = [];
    component.fieldChange.subscribe(e => events.push(e));
    component.onBooleanChange('enabled', true);
    expect(events).toEqual([{ pathKey: 'enabled', value: true }]);
  });

  it('asBoolean should return true only for literal true', () => {
    fixture.componentRef.setInput('values', { ...values, enabled: true });
    fixture.detectChanges();
    expect(component.asBoolean('enabled')).toBe(true);
    fixture.componentRef.setInput('values', { ...values, enabled: false });
    fixture.detectChanges();
    expect(component.asBoolean('enabled')).toBe(false);
  });

  it('asNumber should parse numeric strings and handle invalid values', () => {
    fixture.componentRef.setInput('values', { count: 4 });
    fixture.detectChanges();
    expect(component.asNumber('count')).toBe(4);

    fixture.componentRef.setInput('values', { count: '8' });
    fixture.detectChanges();
    expect(component.asNumber('count')).toBe(8);

    fixture.componentRef.setInput('values', { count: '' });
    fixture.detectChanges();
    expect(component.asNumber('count')).toBeNull();

    fixture.componentRef.setInput('values', { count: 'nope' });
    fixture.detectChanges();
    expect(component.asNumber('count')).toBeNull();
  });

  it('asString should stringify values', () => {
    fixture.componentRef.setInput('values', { locale: null });
    fixture.detectChanges();
    expect(component.asString('locale')).toBe('');

    fixture.componentRef.setInput('values', { count: 5 });
    fixture.detectChanges();
    expect(component.asString('count')).toBe('5');
  });

  it('sectionToggle and save outputs should emit', () => {
    const toggles: string[] = [];
    const saves: unknown[] = [];
    component.sectionToggle.subscribe(key => toggles.push(key));
    component.save.subscribe(() => saves.push(true));
    component.sectionToggle.emit('meta');
    component.save.emit();
    expect(toggles).toEqual(['meta']);
    expect(saves).toEqual([true]);
  });
});
