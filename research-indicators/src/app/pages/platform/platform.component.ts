import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CacheService } from '@services/cache/cache.service';
import { RouterOutlet } from '@angular/router';
import { AllianceNavbarComponent } from '@components/alliance-navbar/alliance-navbar.component';
import { AllianceSidebarComponent } from '@components/alliance-sidebar/alliance-sidebar.component';
import { SectionHeaderComponent } from '@components/section-header/section-header.component';
import { AllModalsComponent } from '../../shared/components/all-modals/all-modals.component';

@Component({
  selector: 'app-platform',
  standalone: true,
  imports: [RouterOutlet, AllianceNavbarComponent, AllianceSidebarComponent, SectionHeaderComponent, AllModalsComponent],
  templateUrl: './platform.component.html',
  styleUrl: './platform.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PlatformComponent implements OnInit {
  cache = inject(CacheService);
  isLoading = signal(document.readyState !== 'complete');
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    window.onload = () => {
      this.isLoading.set(false);
    };

    // document.fonts.ready.then(() => {
    // });
  }
  onImageLoad() {
    const images = document.querySelectorAll('img');
    // all loaded
    Array.from(images).every(img => img.complete);
  }
}
