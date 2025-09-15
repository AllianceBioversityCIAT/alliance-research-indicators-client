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
  'Generate a concise version of the following outcome or impact statement. Your response must summarize the core message and key impact clearly and effectively. The output must not exceed 80 words. Use clear, formal language and maintain the original meaning and intent. Do not include any introduction or explanation—only return the rewritten short statement. Ensure the result is suitable for inclusion in a results reporting platform. The output must be in the same language as the input statement.';
