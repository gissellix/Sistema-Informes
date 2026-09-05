import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-guardia-activa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guardia-activa.component.html',
  styleUrls: ['./guardia-activa.component.css']
})
export class GuardiaActivaComponent implements OnInit {
  currentUser: User | null = null;
  fechaInicio: Date = new Date();
  horaInicio: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    // Restaurar o guardar la fecha y hora de inicio de la guardia activa
    let storedDate = localStorage.getItem('pps_guardia_fecha_inicio');
    let storedTime = localStorage.getItem('pps_guardia_hora_inicio');

    if (!storedDate || !storedTime) {
      const now = new Date();
      storedDate = now.toISOString();
      storedTime = now.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      localStorage.setItem('pps_guardia_fecha_inicio', storedDate);
      localStorage.setItem('pps_guardia_hora_inicio', storedTime);
    }

    this.fechaInicio = new Date(storedDate);
    this.horaInicio = storedTime;
  }

  getFechaFormateada(): string {
    return this.fechaInicio.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Redirige a la pantalla de registro de datos por voz
   */
  registrarDatos(): void {
    this.router.navigate(['/registrar-datos']);
  }

  /**
   * Redirige a la pantalla de registro de novedades por voz
   */
  registrarNovedades(): void {
    this.router.navigate(['/registrar-novedades']);
  }

  /**
   * BACKEND: conectar con GET /api/guardias/:id/informe-final
   * Por ahora muestra un placeholder
   */
  verInformeFinal(): void {
    this.router.navigate(['/vista-previa-informe']);
  }

  /**
   * Regresa al dashboard sin finalizar la guardia.
   */
  retroceder(): void {
    this.router.navigate(['/dashboard-jefe']);
  }

}
