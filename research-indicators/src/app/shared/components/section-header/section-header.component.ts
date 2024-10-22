import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CacheService } from '../../services/cache.service';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss'
})
export class SectionHeaderComponent {
  cache = inject(CacheService);
}
