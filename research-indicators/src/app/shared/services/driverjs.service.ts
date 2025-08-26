import { Injectable, inject } from '@angular/core';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { MenuItem } from 'primeng/api';
import { SetUpProjectService } from '../../pages/platform/pages/set-up-project/set-up-project.service';

@Injectable({
  providedIn: 'root'
})
export class DriverjsService {
  setUpProjectService = inject(SetUpProjectService);
  driverObj = driver({});
  // Tutorial menu items
  tutorialMenuItems: MenuItem[] = [
    {
      label: 'How to Create Level 1 Structure',
      icon: 'pi pi-folder',
      command: () => this.showLevel1StructureTutorial()
    },
    {
      label: 'How to Create Level 2 Structure',
      icon: 'pi pi-folder-open',
      disabled: true,
      command: () => this.showLevel2StructureTutorial()
    },
    {
      label: 'How to Create an Indicator',
      icon: 'pi pi-chart-line',
      disabled: true,
      command: () => this.showCreateIndicatorTutorial()
    }
  ];

  // Tutorial methods
  showLevel1StructureTutorial() {
    this.driverObj = driver({
      showProgress: true,

      steps: [
        {
          element: '.create-structure-button',
          popover: {
            title: 'Add ' + this.setUpProjectService.level1Name(),
            description: 'Click here to add a new ' + this.setUpProjectService.level1Name(),
            showButtons: []
          }
        },
        {
          element: '.new-structure',
          popover: {
            title: 'New Structure',
            description: 'Fill the fields and click save to add a new ' + this.setUpProjectService.level1Name(),
            showButtons: []
          }
        }
      ]
    });

    this.driverObj.drive();
  }

  nextStep() {
    this.driverObj.moveNext();
  }

  showLevel2StructureTutorial() {
    // TODO: Implement Level 2 Structure tutorial
    console.log('Level 2 Structure tutorial');
  }

  showCreateIndicatorTutorial() {
    // TODO: Implement Create Indicator tutorial
    console.log('Create Indicator tutorial');
  }
}
