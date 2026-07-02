import {
  buildPortfolio2AlignmentPatch,
  enrichAlignmentLevers,
  enrichAlignmentSdgTargets,
  enrichPortfolio2Contracts,
  flattenAlignmentContract,
  normalizeContractLevers,
  normalizePortfolio2AlignmentGet
} from './portfolio-2-alignment.mapper';
import { GetAllianceAlignment } from '@shared/interfaces/get-alliance-alignment.interface';

describe('portfolio-2-alignment.mapper', () => {
  it('flattens nested agresso_contract data for display', () => {
    const flattened = flattenAlignmentContract({
      contract_id: 'uuid-1',
      is_primary: true,
      is_active: true,
      result_contract_id: 1,
      result_id: 1,
      contract_role_id: 1,
      agresso_contract: {
        agreement_id: 'A100',
        description: 'Nested project',
        project_lead_description: 'PI Name',
        start_date: '2024-01-01',
        endDateGlobal: '2025-01-01'
      }
    });

    expect(flattened.agreement_id).toBe('A100');
    expect(flattened.description).toBe('Nested project');
    expect(flattened.project_lead_description).toBe('PI Name');
  });

  it('enriches contracts from catalog and normalizes levers', () => {
    const enriched = enrichPortfolio2Contracts(
      [
        {
          contract_id: 'uuid-1',
          is_primary: true,
          is_active: true,
          result_contract_id: 1,
          result_id: 1,
          contract_role_id: 1,
          agresso_contract: {
            agreement_id: 'A100',
            description: 'Project 100'
          }
        } as never
      ],
      [
        {
          agreement_id: 'A100',
          description: 'Project 100',
          contract_id: 'A100',
          select_label: 'A100 - Project 100',
          project_lead_description: 'PI Name',
          start_date: '2024-01-01',
          endDateGlobal: '2025-01-01',
          lever: 'Lever Name',
          leverUrl: 'lever.png',
          is_active: true,
          center_amount: '',
          center_amount_usd: '',
          client: '',
          contract_status: null,
          department: null,
          departmentId: null,
          division: null,
          divisionId: null,
          donor: null,
          is_science_program: false,
          donor_reference: null,
          endDatefinance: '',
          end_date: null,
          entity: null,
          extension_date: null,
          funding_type: null,
          grant_amount: '',
          lever_id: 1,
          grant_amount_usd: '',
          project: null,
          projectDescription: null,
          short_title: '',
          ubwClientDescription: '',
          unit: null,
          unitId: null,
          office: null,
          officeId: null,
          display_label: ''
        }
      ]
    );

    expect(enriched[0].agreement_id).toBe('A100');
    expect(enriched[0].contract_id).toBe('A100');
    expect(enriched[0].select_label).toBe('A100 - Project 100');
    expect(enriched[0].levers?.full_name).toBe('Lever Name');
    expect(normalizeContractLevers({ lever: 'Lever Name', leverUrl: 'lever.png', lever_id: 1 } as never)?.lever_url).toBe('lever.png');
  });

  it('normalizes portfolio 2 GET data for multiselect bindings', () => {
    const normalized = normalizePortfolio2AlignmentGet({
      contracts: [{ contract_id: 'abc', is_primary: true } as never],
      result_sdgs: [{ clarisa_sdg_id: 2 } as never],
      research_areas: [{ lever_id: '42', full_name: 'Area 42' } as never],
      strategic_objectives: [{ strategic_objective_id: 3, name: 'SO 3' } as never],
      impact_outcomes: [{ impact_outcome_id: 5, name: 'IO 5' } as never],
      primary_levers: [{ lever_id: 1 } as never],
      contributor_levers: [{ lever_id: 2 } as never]
    });

    expect(normalized.primary_levers).toEqual([]);
    expect(normalized.contributor_levers).toEqual([]);
    expect(normalized.research_areas[0].lever_id).toBe(42);
    expect(normalized.research_areas[0].id).toBe(42);
    expect(normalized.strategic_objectives[0].id).toBe(3);
    expect(normalized.impact_outcomes[0].id).toBe(5);
    expect(normalized.result_sdgs[0].id).toBe(2);
  });

  it('normalizes real portfolio 2 GET payload with link-only contracts and empty collections', () => {
    const normalized = normalizePortfolio2AlignmentGet(
      {
        contracts: [
          {
            created_at: '2026-01-21T13:06:55.836Z',
            updated_at: '2026-06-30T21:38:49.000Z',
            is_active: true,
            result_contract_id: 11085,
            result_id: 8579,
            contract_id: 'A1048',
            contract_role_id: 1,
            is_primary: true
          } as never
        ],
        result_sdgs: [],
        research_areas: [],
        strategic_objectives: [],
        impact_outcomes: []
      },
      {
        contracts: [
          {
            agreement_id: 'A1048',
            description: 'Project A1048',
            contract_id: 'A1048',
            select_label: 'A1048 - Project A1048',
            project_lead_description: 'Lead',
            start_date: '2024-01-01',
            endDateGlobal: '2025-01-01',
            is_active: true,
            center_amount: '',
            center_amount_usd: '',
            client: '',
            contract_status: null,
            department: null,
            departmentId: null,
            division: null,
            divisionId: null,
            donor: null,
            is_science_program: false,
            donor_reference: null,
            endDatefinance: '',
            end_date: null,
            entity: null,
            extension_date: null,
            funding_type: null,
            grant_amount: '',
            lever_id: 1,
            grant_amount_usd: '',
            project: null,
            projectDescription: null,
            short_title: '',
            ubwClientDescription: '',
            unit: null,
            unitId: null,
            office: null,
            officeId: null,
            display_label: ''
          }
        ]
      }
    );

    expect(normalized.contracts[0].agreement_id).toBe('A1048');
    expect(normalized.contracts[0].description).toBe('Project A1048');
    expect(normalized.contracts[0].select_label).toBe('A1048 - Project A1048');
    expect(normalized.contracts[0].is_primary).toBe(true);
    expect(normalized.result_sdgs).toEqual([]);
    expect(normalized.research_areas).toEqual([]);
    expect(normalized.strategic_objectives).toEqual([]);
    expect(normalized.impact_outcomes).toEqual([]);
  });

  it('uses contract_id as agreement_id when catalog match is unavailable', () => {
    const enriched = enrichPortfolio2Contracts(
      [
        {
          contract_id: 'A1048',
          is_primary: true,
          is_active: true,
          result_contract_id: 11085,
          result_id: 8579,
          contract_role_id: 1
        } as never
      ],
      []
    );

    expect(enriched[0].agreement_id).toBe('A1048');
    expect(enriched[0].contract_id).toBe('A1048');
    expect(enriched[0].select_label).toBe('A1048');
  });

  it('builds portfolio 2 PATCH payload without legacy lever fields', () => {
    const body: GetAllianceAlignment = {
      contracts: [
        { contract_id: 'a1', is_primary: true } as never,
        { contract_id: 'b2', is_primary: false } as never
      ],
      result_sdgs: [{ id: 2, clarisa_sdg_id: 2 } as never],
      primary_levers: [],
      contributor_levers: [],
      research_areas: [{ id: 10, lever_id: 10 } as never],
      strategic_objectives: [{ id: 1, name: 'SO 1' }],
      impact_outcomes: [{ id: 5, name: 'IO 5' }]
    };

    expect(buildPortfolio2AlignmentPatch(body, true)).toEqual({
      contracts: [
        { contract_id: 'a1', is_primary: true },
        { contract_id: 'b2', is_primary: false }
      ],
      result_sdgs: [{ clarisa_sdg_id: 2 }],
      research_areas: [{ lever_id: '10' }],
      strategic_objectives: [{ strategic_objective_id: 1 }],
      impact_outcomes: [{ impact_outcome_id: 5 }]
    });
  });

  it('omits impact_outcomes when indicator does not use them', () => {
    const body: GetAllianceAlignment = {
      contracts: [],
      result_sdgs: [],
      primary_levers: [],
      contributor_levers: [],
      strategic_objectives: [],
      impact_outcomes: [{ id: 5, name: 'IO 5' }]
    };

    expect(buildPortfolio2AlignmentPatch(body, false).impact_outcomes).toBeUndefined();
    expect(buildPortfolio2AlignmentPatch(body, false)).not.toHaveProperty('impact_outcomes');
  });

  it('includes empty impact_outcomes when indicator uses them but none are selected', () => {
    const body: GetAllianceAlignment = {
      contracts: [],
      result_sdgs: [],
      primary_levers: [],
      contributor_levers: [],
      strategic_objectives: [],
      impact_outcomes: []
    };

    expect(buildPortfolio2AlignmentPatch(body, true).impact_outcomes).toEqual([]);
  });

  it('sends empty result_sdgs only when explicitly excluded (OICR rule)', () => {
    const body: GetAllianceAlignment = {
      contracts: [],
      result_sdgs: [{ id: 2, clarisa_sdg_id: 2 } as never],
      primary_levers: [],
      contributor_levers: [],
      strategic_objectives: [],
      impact_outcomes: []
    };

    expect(buildPortfolio2AlignmentPatch(body, false, false).result_sdgs).toEqual([]);
    expect(buildPortfolio2AlignmentPatch(body, false, true).result_sdgs).toEqual([{ clarisa_sdg_id: 2 }]);
  });

  it('enriches alignment levers from catalog while preserving saved fields', () => {
    const enriched = enrichAlignmentLevers(
      [
        {
          lever_id: 3,
          result_lever_id: 1,
          result_id: 1,
          lever_role_id: 1,
          is_primary: true,
          custom_lever_name: 'Should stay'
        } as never
      ],
      [{ id: 3, lever_id: 3, short_name: 'Catalog', other_names: 'Catalog full', full_name: 'Catalog', icon: 'icon.png' } as never]
    );

    expect(enriched[0].short_name).toBe('Catalog');
    expect(enriched[0].icon).toBe('icon.png');
    expect(enriched[0].custom_lever_name).toBe('Should stay');
  });

  it('defaults Other lever labels when catalog does not include lever 9', () => {
    const enriched = enrichAlignmentLevers(
      [{ lever_id: 9, result_lever_id: 1, result_id: 1, lever_role_id: 1, is_primary: true } as never],
      [{ id: 1, lever_id: 1, short_name: 'Lever 1', full_name: 'Lever 1', other_names: '' } as never]
    );

    expect(enriched[0].short_name).toBe('Other');
    expect(enriched[0].other_names).toBe('Other');
  });

  it('enriches alignment SDG targets from catalog while preserving saved fields', () => {
    const enriched = enrichAlignmentSdgTargets(
      [
        {
          sdg_target_id: 12,
          sdg_target_code: '2.3',
          sdg_target: 'Saved label',
          clarisa_sdg: { id: 2, icon: 'saved.png' }
        }
      ],
      [
        {
          id: 12,
          sdg_target_id: 12,
          sdg_target_code: '2.3',
          sdg_target: 'Catalog label',
          select_label: '2.3 — Catalog label',
          clarisa_sdg: { id: 2, icon: 'catalog.png' }
        } as never
      ]
    );

    expect(enriched[0].sdg_target).toBe('Saved label');
    expect(enriched[0].clarisa_sdg?.icon).toBe('saved.png');
    expect(enriched[0].select_label).toBe('2.3 — Catalog label');
  });
});
