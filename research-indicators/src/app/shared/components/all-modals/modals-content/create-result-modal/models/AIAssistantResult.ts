export interface AIAssistantResult {
  indicator: string;
  title: string;
  description: string;
  keywords: string[];
  geoscope: CountryArea[];
  training_type: string;
  total_participants: number;
  non_binary_participants: string;
  female_participants: number;
  male_participants: number;
}

export interface CountryArea {
  country_code: string;
  areas: string[];
}
