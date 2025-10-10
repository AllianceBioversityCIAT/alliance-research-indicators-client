type DetailValue = 'total_participants' | 'non_binary_participants' | 'female_participants' | 'male_participants';

interface ExpandedItemDetail {
  title: string;
  value: DetailValue;
}

interface IndicatorTypeIcon {
  icon: string;
  type: string;
  class: string;
}

interface IndicatorIconResult {
  class?: string;
  icon?: string;
}

export const EXPANDED_ITEM_DETAILS: ExpandedItemDetail[] = [
  { title: 'Total participants', value: 'total_participants' },
  { title: 'Non-binary', value: 'non_binary_participants' },
  { title: 'Female', value: 'female_participants' },
  { title: 'Male', value: 'male_participants' }
];

export const INDICATOR_TYPE_ICONS: IndicatorTypeIcon[] = [
  { icon: 'group', type: 'Capacity Sharing for Development', class: 'output-icon' },
  { icon: 'flag', type: 'Innovation Development', class: 'output-icon' },
  { icon: 'lightbulb', type: 'Knowledge Product', class: 'output-icon' },
  { icon: 'wb_sunny', type: 'Innovation Use', class: 'outcome-icon' },
  { icon: 'pie_chart', type: 'Research Output', class: 'outcome-icon' },
  { icon: 'folder_open', type: 'Policy Change', class: 'outcome-icon' }
];

export const getIndicatorTypeIcon = (type: string): IndicatorIconResult => {
  const icon = INDICATOR_TYPE_ICONS.find(icon => icon.type === type);
  return {
    class: icon?.class,
    icon: icon?.icon
  };
};

export const PROMPT_OICR_DETAILS =
  `Summarize the following text using the following two-part structured format:

  OVERVIEW OF THE RESULTS
  Provide a concise introductory paragraph that captures the key context, stakeholders, and purpose of the initiative or project. Emphasize the transformative change, policy relevance, or strategic importance of the work. The tone should be professional and policy- or results-oriented, highlighting the “why it matters” dimension. Include geographic and temporal scope, and briefly mention methodologies or frameworks used if relevant.

  HIGHLIGHTS Use 5–7 bullet points to present the most concrete, measurable, and policy-relevant outcomes. Focus on:
  – Quantitative results (e.g. yield increases, farmer adoption rates, income gains)
  – Institutional uptake (e.g. government use, policy integration, scaling)
  – Tools and innovations developed (e.g. digital platforms, decision-support tools)
  – Capacity-building activities (e.g. training numbers, stakeholder engagement)
  – Geographic spread (e.g. number of provinces, districts, countries) – Environmental or social impact (e.g. improved soil health, resilience, equity)
  – Lessons or enablers (e.g. community engagement, technology adoption, co-design)

  Be precise. Use numbers, names, locations, and years where available. Begin each bullet point with a bold, outcome-oriented phrase. Avoid fluff—each bullet should represent a key result or actionable insight. The output must be in the same language as the input statement`;
