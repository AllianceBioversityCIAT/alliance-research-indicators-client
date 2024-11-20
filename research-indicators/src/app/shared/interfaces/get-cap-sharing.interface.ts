export interface SessionFormat {
  session_format_id: number;
  name: string;
}

export interface SessionType {
  session_type_id: number;
  name: string;
}

export interface Degree {
  is_active: boolean;
  degree_id: number;
  name: string;
}

export interface Length {
  is_active: boolean;
  length_id: number;
  name: string;
}

export interface Gender {
  is_active: boolean;
  gender_id: number;
  name: string;
}

export interface GetCapSharing {
  delivery_modality_id?: null;
  end_date?: null;
  session_format_id?: number;
  session_type_id?: number;
  start_date?: null;
  individual?: Individual;
  loaded?: boolean;
  aux_trainee_name?: string;
}

interface Individual {
  degree_id?: number;
  gender_id?: number;
  trainee_name?: string;
  session_length_id?: number;
  affiliation?: null;
}
