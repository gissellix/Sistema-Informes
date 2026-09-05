import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GpsTrackingService } from './services/gps-tracking.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'pps-policia';

  // Inyectamos el servicio de rastreo GPS para que empiece su ejecución automática
  constructor(private gpsTrackingService: GpsTrackingService) {}
}
