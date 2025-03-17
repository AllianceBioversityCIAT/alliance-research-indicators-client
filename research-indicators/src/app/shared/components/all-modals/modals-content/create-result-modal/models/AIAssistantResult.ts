export interface AIAssistantResult {
  indicator: string;
  title: string;
  description: string;
  keywords: string[];
  geoscope: {
    level: string;
    sub_list: string[];
  };
  training_type: string;
  total_participants: number;
  non_binary_participants: number;
  female_participants: number;
  male_participants: number;
}
