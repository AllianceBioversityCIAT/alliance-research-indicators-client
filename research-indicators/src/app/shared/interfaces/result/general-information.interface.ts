export interface GeneralInformation {
  title: string;
  description: string;
  keywords: Keyword[];
  main_contract_person: Maincontractperson;
}

interface Maincontractperson {
  result_user_id: number;
  result_id: number;
  user_id: number;
  user_role_id: number;
}

interface Keyword {
  result_keyword_id: number;
  result_id: number;
  keyword: string;
}
