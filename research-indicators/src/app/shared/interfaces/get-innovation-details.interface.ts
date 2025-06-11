export interface GetInnovationDetails {
  contracts: Contract[];
}

interface Contract {
  is_active: boolean;
}
