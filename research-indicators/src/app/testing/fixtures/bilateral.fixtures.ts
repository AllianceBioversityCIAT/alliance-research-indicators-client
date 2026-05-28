// Shared bilateral-module test fixtures.
// @sdd-spec docs/specs/bilateral-module/indicator-mapping (T-BIL-IM-04)
//
// Add new bilateral fixtures here rather than re-building shapes per spec file
// (alignment-section + indicator-mapping precedent). The HLOs fixture mirrors the
// live `GET .../hlos-indicators` wire shape, including the upstream PRMS misspelling
// `unit_messurament` and the `category` OUTCOME/OUTPUT discriminator.

import { BilateralHlosIndicatorsResponse, HloMapping } from '@interfaces/bilateral/pool-funding-alignment.interface';

/**
 * Canonical `has_aow` HLOs response: two pairs (SP01/AOW06, SP02/AOW02), the first
 * carrying one OUTCOME (2 indicators — one with a unit, one without) plus one OUTPUT
 * (1 indicator with a unit), the second carrying a single OUTCOME with one indicator.
 * Indicator ids are globally unique so flattening produces 4 rows.
 */
export const bilateralHlosIndicatorsResponseMock: BilateralHlosIndicatorsResponse = {
  result_code: '19792',
  mapping_status: 'mapped',
  aow_status: 'has_aow',
  clarisa_project: { id: 1, short_name: 'T-PJ-003262' },
  pairs: [
    {
      program: 'SP01',
      area_of_work: 'AOW06',
      composite_code: 'SP01-AOW06',
      metadata: { total: 3, outcomes: 2, outputs: 1 },
      outcomes: [
        {
          toc_result_id: 1001,
          category: 'OUTCOME',
          result_title: 'Outcome A',
          indicators: [
            {
              indicator_id: '5001',
              indicator_description: 'Number of farmers adopting practice',
              unit_messurament: 'farmers',
              target_value_sum: 1200,
              progress_percentage: '40'
            },
            {
              indicator_id: '5002',
              indicator_description: 'Qualitative narrative of adoption',
              unit_messurament: null,
              target_value_sum: null
            }
          ]
        }
      ],
      outputs: [
        {
          toc_result_id: 2001,
          category: 'OUTPUT',
          result_title: 'Output A',
          indicators: [
            {
              indicator_id: '6001',
              indicator_description: 'Hectares under improved management',
              unit_messurament: 'ha',
              target_value_sum: '350'
            }
          ]
        }
      ]
    },
    {
      program: 'SP02',
      area_of_work: 'AOW02',
      composite_code: 'SP02-AOW02',
      metadata: { total: 1, outcomes: 1, outputs: 0 },
      outcomes: [
        {
          toc_result_id: 1002,
          category: 'OUTCOME',
          result_title: 'Outcome B',
          indicators: [
            {
              indicator_id: '5003',
              indicator_description: 'Policies influenced',
              unit_messurament: 'policies',
              target_value_sum: 4
            }
          ]
        }
      ],
      outputs: []
    }
  ]
};

/**
 * `no_aow_mappings` HLOs response: a single pair whose `area_of_work` is the empty
 * token, exercising the flat-per-SP path. Selection keys for this pair use `''` as
 * the AOW segment.
 */
export const bilateralHlosNoAowResponseMock: BilateralHlosIndicatorsResponse = {
  result_code: '19792',
  mapping_status: 'mapped',
  aow_status: 'no_aow_mappings',
  clarisa_project: { id: 2, short_name: 'T-PJ-NO-AOW' },
  pairs: [
    {
      program: 'SP05',
      area_of_work: '',
      composite_code: 'SP05-',
      metadata: { total: 1, outcomes: 1, outputs: 0 },
      outcomes: [
        {
          toc_result_id: 1005,
          category: 'OUTCOME',
          result_title: 'Outcome no-AOW',
          indicators: [
            {
              indicator_id: '7001',
              indicator_description: 'Flat indicator under SP only',
              unit_messurament: 'units',
              target_value_sum: 99
            }
          ]
        }
      ],
      outputs: []
    }
  ]
};

/** A persisted mapping whose key matches indicator 5001 in the canonical fixture. */
export const persistedMappingMock: HloMapping = {
  result_code: '19792',
  lever_code: 'SP01',
  lever_name: 'Science Program 01',
  aow_code: 'AOW06',
  aow_name: 'AOW06',
  indicator_code: '5001',
  indicator_name: 'Number of farmers adopting practice',
  indicator_type: 'outcome',
  is_stale: false,
  is_quantitative: true,
  target_description: '1200 farmers',
  quantitative_contribution: 'Significant',
  reason_code: 'direct'
};
