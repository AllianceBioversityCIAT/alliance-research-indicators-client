export interface GeneralInformation {
  title: string;
  description: string;
  keywords: {
    result_keyword_id: number;
    result_id: number;
    keyword: string;
  }[];
  main_contract_person: {
    result_user_id: number;
    result_id: number;
    user_id: number;
    user_role_id: number;
  };
}
