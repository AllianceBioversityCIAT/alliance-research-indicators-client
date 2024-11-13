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
  session_format_id: number;
  session_type_id: number;
  degree_id: number;
  length_id: number;
  gender_id: number;
}
