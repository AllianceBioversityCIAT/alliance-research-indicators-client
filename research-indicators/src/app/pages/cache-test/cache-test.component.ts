import { Component } from '@angular/core';
import { VersionNumberComponent } from '@pages/landing/components/version-number/version-number.component';

@Component({
  selector: 'app-cache-test',
  imports: [VersionNumberComponent],
  templateUrl: './cache-test.component.html',
  styleUrl: './cache-test.component.scss'
})
export default class CacheTestComponent {}
