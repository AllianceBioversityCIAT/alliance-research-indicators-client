import { Injectable, Injector } from '@angular/core';
import { GetContractsService } from './control-list/get-contracts.service';
import { GetLeversService } from './control-list/get-levers.service';
import { GetInstitutionsService } from './control-list/get-institutions.service';
import { ControlListServices } from '../interfaces/services.interface';
import { GetUserStaffService } from './control-list/get-user-staff.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceLocatorService {
  constructor(private injector: Injector) {}

  getService(serviceName: ControlListServices) {
    switch (serviceName) {
      case 'contracts':
        return this.injector.get(GetContractsService);
      case 'levers':
        return this.injector.get(GetLeversService);
      case 'institutions':
        return this.injector.get(GetInstitutionsService);
      case 'userStaff':
        return this.injector.get(GetUserStaffService);
      default:
        console.warn(`Service ${serviceName} not found`);
        return [];
    }
  }
}
