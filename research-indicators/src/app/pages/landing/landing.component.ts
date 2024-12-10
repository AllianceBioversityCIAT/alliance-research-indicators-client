import { Component } from '@angular/core';
import { BannerComponent } from './components/banner/banner.component';
import { FeaturesComponent } from './components/features/features.component';
import { HeroComponent } from './components/hero/hero.component';
import { IndicatorsInfoComponent } from './components/indicators-info/indicators-info.component';
import { FooterComponent } from './components/footer/footer.component';
import { FaqComponent } from './components/faq/faq.component';
import { VersionNumberComponent } from './components/version-number/version-number.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [BannerComponent, FeaturesComponent, HeroComponent, IndicatorsInfoComponent, FaqComponent, FooterComponent, VersionNumberComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export default class LandingComponent {}
