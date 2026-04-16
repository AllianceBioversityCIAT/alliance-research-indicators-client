export interface AdministrationNavChild {
  label: string;
  link: string;
  icon?: string;
  s3Image?: string;
  hide?: boolean;
}

export interface AdministrationNavGroup {
  id: string;
  label: string;
  icon: string;
  children: AdministrationNavChild[];
}
