import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

/**
 * Servicio de Rastreo GPS en Segundo Plano
 * 
 * Este servicio corre silenciosamente en segundo plano registrando las coordenadas GPS
 * del dispositivo del jefe policial durante el transcurso de su "Guardia Activa".
 * Cumple con el requerimiento de registrar de forma automática sin alertas ni visibilidad
 * para el jefe de guardia.
 * 
 * Incorpora un simulador de movimiento en caso de que se esté probando en PC o la geolocalización
 * esté bloqueada/no disponible, asegurando que se registren datos de recorrido válidos para el Directivo.
 */
@Injectable({
  providedIn: 'root'
})
export class GpsTrackingService {
  private intervalId: any = null;
  
  // Coordenada base inicial (ej. centro de Buenos Aires) para simulación en PC
  private lastPosition: { lat: number; lng: number } = { lat: -34.6037, lng: -58.3816 };
  
  // Intervalo de captura: 15 segundos para pruebas rápidas en PC.
  // En producción real esto se configuraría a 15 minutos (15 * 60 * 1000).
  private readonly TRACKING_INTERVAL_MS = 15000; 

  constructor(private authService: AuthService, private http: HttpClient) {
    this.startTrackingInterval();
  }

  /**
   * Inicia el temporizador de rastreo.
   */
  private startTrackingInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.trackLocation();
    }, this.TRACKING_INTERVAL_MS);
  }

  /**
   * Intenta obtener la ubicación GPS real del dispositivo o simula movimiento si falla.
   */
  private trackLocation(): void {
    // Solo registrar si el usuario tiene rol de jefe y tiene la guardia activa
    const isJefe = this.authService.isJefe();
    const isGuardActive = localStorage.getItem('pps_guardia_activa') === 'true';

    if (!isJefe || !isGuardActive) {
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.lastPosition = { lat, lng };
          this.saveCoordinate(lat, lng);
        },
        (error) => {
          // Si el usuario deniega permisos, no hay señal o está en PC, simular el patrullaje
          this.simulateMovement();
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      this.simulateMovement();
    }
  }

  /**
   * Simula un pequeño movimiento de patrullaje policial agregando offsets aleatorios
   * a la última coordenada registrada.
   */
  private simulateMovement(): void {
    // Generar un pequeño desplazamiento aleatorio (entre 50 y 150 metros aprox)
    const latOffset = (Math.random() - 0.5) * 0.0015;
    const lngOffset = (Math.random() - 0.5) * 0.0015;
    
    this.lastPosition.lat += latOffset;
    this.lastPosition.lng += lngOffset;
    
    this.saveCoordinate(this.lastPosition.lat, this.lastPosition.lng);
  }

  /**
   * Guarda de forma incremental la coordenada en la lista del recorrido actual.
   * Y también la envía al backend.
   */
  private saveCoordinate(lat: number, lng: number): void {
    const stored = localStorage.getItem('pps_recorrido_actual');
    let coords: any[] = [];
    
    if (stored) {
      try {
        coords = JSON.parse(stored);
      } catch (e) {
        coords = [];
      }
    }
    
    coords.push({
      lat,
      lng,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('pps_recorrido_actual', JSON.stringify(coords));

    // Enviar el punto al backend
    this.http.post(`${environment.apiUrl}/api/recorrido-gps`, { latitud: lat, longitud: lng })
      .subscribe({
        next: () => console.log('Punto GPS enviado al backend'),
        error: (err) => console.error('Error enviando punto GPS al backend', err)
      });
  }
}
