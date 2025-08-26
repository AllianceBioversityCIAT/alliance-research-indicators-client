import { Injectable } from '@angular/core';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { MenuItem } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class DriverjsService {
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
      command: () => this.showLevel2StructureTutorial()
    },
    {
      label: 'How to Create an Indicator',
      icon: 'pi pi-chart-line',
      command: () => this.showCreateIndicatorTutorial()
    }
  ];

  // Tutorial methods
  showLevel1StructureTutorial() {
    // TODO: Implement Level 1 Structure tutorial
    console.log('Level 1 Structure tutorial');
  }

  showLevel2StructureTutorial() {
    // TODO: Implement Level 2 Structure tutorial
    console.log('Level 2 Structure tutorial');
  }

  showCreateIndicatorTutorial() {
    // TODO: Implement Create Indicator tutorial
    console.log('Create Indicator tutorial');
  }

  example() {
    setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        steps: [
          { element: '#example', popover: { title: 'Title', description: 'Description' } },
          { element: '#example2', popover: { title: 'Title', description: 'Description' } }
        ]
      });

      driverObj.drive();
    }, 1000);
  }
}
