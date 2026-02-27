import { computed, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '@shared/services/submission.service';
import { ButtonModule } from 'primeng/button';

const RESULT_SIDEBAR_WIDTH_PX = 322;
const SECTION_SIDEBAR_OFFSET_PX = 80;

@Component({
  selector: 'app-navigation-buttons',
  imports: [ButtonModule],
  templateUrl: './navigation-buttons.component.html',
  styles: [`:host { display: block; }`]
})
export class NavigationButtonsComponent {
  submission = inject(SubmissionService);
  cache = inject(CacheService);

  /** Left offset so the bar aligns with result-content (platform padding + result sidebar). */
  navLeft = computed(() => {
    const hss = this.cache.hasSmallScreen();
    const collapsed = this.cache.isSidebarCollapsed();
    let paddingLeft: number;
    if (hss) {
      paddingLeft = collapsed ? 64 : 250;
    } else {
      paddingLeft = collapsed ? 75 : 250;
    }
    return paddingLeft + RESULT_SIDEBAR_WIDTH_PX;
  });

  navRight = computed(() => SECTION_SIDEBAR_OFFSET_PX);

  @Input() showBack = true;
  @Input() showNext = true;
  @Input() showSave = false;
  @Input() disableSave = false;
  @Input() disableNext = false;

  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
}
