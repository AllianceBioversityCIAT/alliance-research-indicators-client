export interface InteractionFeedbackPayload {
  user_id: string;
  ai_output: Record<string, unknown> | null;
  service_name: string;
  update_mode: boolean;
  interaction_id: string | null;
  feedback_type: 'positive' | 'negative' | null;
  feedback_comment: string;
}


