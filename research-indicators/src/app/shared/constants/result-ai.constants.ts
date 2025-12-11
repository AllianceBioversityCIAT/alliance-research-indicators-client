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
`Summarize the following text in no more than 80 words, keeping the same language as the input.

Your output must follow this format:

OVERVIEW OF RESULTS
Write 1 short paragraph capturing the core context, purpose, stakeholders, and significance of the work. Highlight why it matters and any relevant geographic or temporal scope.

HIGHLIGHTS
Provide 5–7 very brief bullet points capturing only the most concrete outcomes — quantitative results, institutional uptake, tools/innovations, capacity building, geographic reach, and key environmental or social effects. Use numbers and proper names when available. Each bullet must begin with a short, outcome-focused phrase.

Return only the summary.`;
