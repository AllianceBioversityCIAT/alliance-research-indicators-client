import { GetContractsService } from '../services/control-list/get-contracts.service';
import { GetLeversService } from '../services/control-list/get-levers.service';
import { GetInstitutionsService } from '../services/control-list/get-institutions.service';
import { GetCapSharingService } from '../services/control-list/get-cap-sharing.service';

export type ControlListServices = GetContractsService | GetLeversService | GetInstitutionsService | GetCapSharingService | never[];
