import { Injectable } from '@angular/core';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

@Injectable({
  providedIn: 'root'
})
export class DriverjsService {
  constructor() {}

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
