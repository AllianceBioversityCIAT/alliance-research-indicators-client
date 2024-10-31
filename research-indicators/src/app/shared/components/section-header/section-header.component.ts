import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { CacheService } from '@services/cache/cache.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss'
})
export class SectionHeaderComponent implements OnInit {
  cache = inject(CacheService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  routeData: WritableSignal<any> = signal({});

  ngOnInit(): void {
    // Cargar la data de la ruta en la primera carga
    this.routeData.set(this.getRouteData(this.route));
    console.log(this.routeData()); // Muestra los datos de la primera carga

    // Escucha los cambios de navegación para actualizar los datos de la ruta
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.routeData.set(this.getRouteData(this.route));
      this.cache.setCurrentSectionHeaderName('');
      console.log(this.routeData()); // Muestra los datos de la ruta actual
    });
  }

  // Función para obtener todos los datos de la ruta activa
  private getRouteData(route: ActivatedRoute): any {
    let data = {};

    // Recorre la jerarquía de rutas activas y recoge los datos
    while (route.firstChild) {
      route = route.firstChild;
      data = { ...data, ...route.snapshot.data };
    }

    return data;
  }
}
