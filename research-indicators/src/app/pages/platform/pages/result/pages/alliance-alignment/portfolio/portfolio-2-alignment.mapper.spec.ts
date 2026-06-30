import {
  buildPortfolio2AlignmentPatch,
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
    expect(normalized.research_areas[0].lever_id).toBe('42');
    expect(normalized.research_areas[0].id).toBe(42);
    expect(normalized.strategic_objectives[0].id).toBe(3);
    expect(normalized.impact_outcomes[0].id).toBe(5);
    expect(normalized.result_sdgs[0].id).toBe(2);
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

  it('sends empty impact_outcomes when indicator does not use them', () => {
    const body: GetAllianceAlignment = {
      contracts: [],
      result_sdgs: [],
      primary_levers: [],
      contributor_levers: [],
      strategic_objectives: [],
      impact_outcomes: [{ id: 5, name: 'IO 5' }]
    };

    expect(buildPortfolio2AlignmentPatch(body, false).impact_outcomes).toEqual([]);
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
});
