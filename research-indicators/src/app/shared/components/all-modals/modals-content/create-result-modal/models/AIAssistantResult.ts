export interface AIAssistantResult {
  indicator: string;
  title: string;
  description: string;
  keywords: string[];
  geoscope: Geoscope;
  training_type: string;
  total_participants: string;
  male_participants: string;
  female_participants: string;
  non_binary_participants: string;
  training_modality: string;
  start_date: string;
  end_date: string;
  length_of_training: string;
  alliance_main_contact_person_first_name: string;
  alliance_main_contact_person_last_name: string;
  evidence_for_stage: string;
  policy_type: string;
  stage_in_policy_process: string;
  temp_result_ai: number;
}

export interface Geoscope {
  level: string;
  sub_list: string[];
}
