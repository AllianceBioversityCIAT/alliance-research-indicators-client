export interface MainResponse<T> {
  data: T;
  status: number;
  description: string;
  timestamp: string;
  path: string;
  successfulRequest: boolean;
}

export interface ErrorResponse {
  error: boolean;
  detail: string;
}

export interface LoginRes {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface DecodedUserData {
  user_id?: number;
  first_name?: string;
  last_name?: string;
  iat?: number;
  exp?: number;
  letter?: string;
  isLogged: boolean;
}
interface User {
  is_active: boolean;
  sec_user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  status_id: number;
  user_role_list: Userrolelist[];
}

interface Userrolelist {
  is_active: boolean;
  user_id: number;
  role_id: number;
  role: Role;
}

interface Role {
  is_active: boolean;
  justification_update: null;
  sec_role_id: number;
  name: string;
  focus_id: number;
}
