import { Component, inject, computed } from '@angular/core';
import { VersionSelectorComponent } from '@pages/platform/pages/result/components/version-selector/version-selector.component';
import { CacheService } from '@shared/services/cache/cache.service';

@Component({
  selector: 'app-form-header',
  imports: [VersionSelectorComponent],
  templateUrl: './form-header.component.html'
})
export class FormHeaderComponent {
  cache = inject(CacheService);

  sectionTitle = computed(() => this.cache.currentMetadata().result_title);
}
