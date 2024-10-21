import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IndicatorsService {
  aboutIndicatorData = {
    output: {
      title: 'OUTPUTS',
      description: 'Knowledge, technical or institutional advancement produced by Alliance research, engagement and/or capacity development activities.',
      list: [
        { content: '<strong>Hello World</strong>', id: 1, type: 'OUTPUT', title: 'Innovation Development', description: 'A new, improved, or adapted output or groups of outputs such as technologies, products and services, policies, and other organizational and institutional arrangements with high potential to contribute to positive impacts when used at scale.', icon: 'flag' },
        { id: 2, type: 'OUTPUT', title: 'Capacity Sharing for Development', description: 'Number of individuals trained or engaged by Alliance staff, aiming to lead to behavioral changes in knowledge, attitude, skills, and practice among CGIAR and non-CGIAR personnel.', icon: 'group' },
        { id: 3, type: 'OUTPUT', title: 'Knowledge Product', description: 'Defined by the CGIAR Open and FAIR Data Assets Policy using the term data asset. For reporting, users should only consider knowledge products that are integral to the Initiative/Project’s Theory of Change (ToC). To be eligible for reporting, a knowledge product should be a finalized product. Other data assets illustrating an output or outcome should not be reported under this indicator and should instead be used as evidence for the relevant output or outcome. ', icon: 'lightbulb' }
      ]
    },
    outcome: {
      title: 'OUTCOMES',
      description: 'A change in knowledge, skills, attitudes and/or relationships, which manifests as a change in behavior in particular actors, to which research outputs and related activities have contributed.',
      list: [
        { id: 4, type: 'OUTCOME', title: 'Innovation Use', description: 'A metric used to assess the extent to which an innovation is already being used, by which type of users and under which conditions, with a scale ranging from no use (lowest level) to common use (highest level).', icon: 'wb_sunny' },
        { id: 5, type: 'OUTCOME', title: 'OICR', description: 'An evidence-based report detailing any outcome or impact that has resulted from the work of one or more CGIAR programs, initiatives, or centers. Outcome impact case reports must cite robust evidence to demonstrate the contribution of the CGIAR entity’s research findings or innovations to the outcome or impact. They are used to demonstrate results to funders.', icon: 'pie_chart' },
        { id: 6, type: 'OUTCOME', title: 'Policy Change', description: 'Policies, strategies, legal instruments, programs, budgets, or investments at different scales (local to global) that have been modified in design or implementation, with evidence that the change was informed by Alliance research.', icon: 'folder_open' }
      ]
    }
  };
}
