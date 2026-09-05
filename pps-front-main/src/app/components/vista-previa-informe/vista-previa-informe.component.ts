import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import {
  InformeService,
  InformeDTO
} from '../../services/informe-service';

@Component({
  selector: 'app-vista-previa-informe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vista-previa-informe.component.html',
  styleUrls: ['./vista-previa-informe.component.css']
})
export class VistaPreviaInformeComponent implements OnInit {
  currentUser: User | null = null;
  fechaActual: Date = new Date();
  horaInicio: string = '';
  informeConsolidadoText: string = '';

  // Propiedades para maquetar la vista previa estructurada oficial de Jujuy
  informe: InformeDTO | null = null;

  /**
   * Ruta al escudo oficial de la institución.
   * Para cambiarla, reemplazar el archivo public/escudo.png
   */
  readonly escudoPath: string = 'escudo.png';

  constructor(
    private authService: AuthService,
    private router: Router,
    private informeService: InformeService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated() || !this.authService.isJefe()) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarVistaPrevia();
  }

  cargarVistaPrevia(): void {
    this.informeService.obtenerVistaPrevia()
      .subscribe({
        next: (informe) => {
          console.log(
            'Informe recibido desde backend:',
            informe
          );
          this.informe = informe;
          this.informeConsolidadoText =
            this.generarTextoConsolidado(informe);
        },
        error: (error) => {
          console.error(
            'Error cargando vista previa:',
            error
          );
          alert(
            error.error?.message ||
            'No se pudo cargar la vista previa del informe.'
          );
        }
      });
  }

  generarTextoConsolidado(
    informe: InformeDTO
    ): string {
      let texto = `=== INFORME DE GUARDIA DE SERVICIO ===
    Fecha de Guardia: ${informe.fechaInicio}
    Jefe de Guardia: ${informe.nombreApellidoJefe}
    Legajo: ${informe.legajoJefe}
    Jerarquía: ${informe.jerarquiaJefe}
    Unidad Regional: ${informe.unidadRegional}
    --------------------------------------------------
    DATOS DEL TURNO
    PERSONAL ASIGNADO:
    `;
      if (
        informe.personalTurnoList &&
        informe.personalTurnoList.length > 0
      ) {
        informe.personalTurnoList.forEach(
          (p) => {
            texto +=
              `• [Legajo ${p.legajo}] ` +
              `${p.nombre} ${p.apellido} ` +
              `(${p.jerarquia})\n`;
          }
        );
      } else {
        texto +=
          'Ninguno registrado.\n';
      }
      texto += `
    CHOFER Y MÓVIL DE SERVICIO:
    `;
      if (informe.nombreApellidoChofer) {
        texto +=
          `${informe.nombreApellidoChofer} ` +
          `(Legajo ${informe.legajoChofer})\n`;
        texto +=
          `Jerarquía: ${informe.jerarquiaChofer}\n`;
        texto +=
          `Móvil: ${informe.numeroMovil || 'Sin móvil'}\n`;
        texto +=
          `Patente: ${informe.patente || 'Sin patente'}\n`;
      } else {
        texto +=
          'Ningún chofer asignado.\n';
      }
      texto += `
    --------------------------------------------------
    NOVEDADES
    `;
      if (
        informe.novedades &&
        informe.novedades.length > 0
      ) {
        informe.novedades.forEach(
          (n, index) => {
            texto +=
              `${index + 1}. ${n.tipo} - ` +
              `${n.descripcion}\n`;
          }
        );

      } else {
        texto +=
          'No se registraron novedades.\n';
      }
    return texto;
  }

  /**
   * Navega a Registrar Datos con el indicador de modo edición,
   * para que el componente destino muestre el banner de contexto.
   */
  editarDatos(): void {
    this.router.navigate(['/registrar-datos'], { queryParams: { modo: 'edicion' } });
  }

  /**
   * Navega a Registrar Novedades con el indicador de modo edición,
   * para que el componente destino muestre el banner de contexto.
   */
  editarNovedades(): void {
    this.router.navigate(['/registrar-novedades'], { queryParams: { modo: 'edicion' } });
  }

  /**
   * Retorna el rango de fechas en formato: DIA DE INICIO a DIA DEL FINAL del MES de AÑO
   */
  getFechaFormatoRequerido(): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const startStr = localStorage.getItem('pps_guardia_fecha_inicio');
    const startDate = startStr ? new Date(startStr) : new Date();
    const endDate = new Date(); // Cierre actual

    const diaInicio = startDate.getDate();
    const diaFin = endDate.getDate();
    const mes = meses[endDate.getMonth()];
    const anio = endDate.getFullYear();

    return `${diaInicio} a ${diaFin} de ${mes} de ${anio}`;
  }

  getFechaFormateada(): string {
    return this.fechaActual.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  obtenerTurnoActual(): string {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 14) return 'Mañana';
    if (hora >= 14 && hora < 22) return 'Tarde';
    return 'Noche';
  }

  finalizarYGuardar(): void {
    if (!this.informeConsolidadoText.trim()) {
      alert('El texto del informe no puede estar vacío.');
      return;
    }
    const confirmar = confirm(
      '¿Está seguro de que desea finalizar el turno actual y guardar el informe? Esta acción no se puede deshacer.'
    );
    if (!confirmar) {
      return;
    }
    this.informeService.guardarFinalizar(this.informeConsolidadoText).subscribe({
    next: () => {

      console.log('Turno finalizado correctamente.');

      // Limpiar datos temporales del turno finalizado
      localStorage.removeItem('pps_datos_turno');
      localStorage.removeItem('pps_anovedadturno');
      localStorage.removeItem('pps_guardia_activa');
      localStorage.removeItem('pps_guardia_fecha_inicio');
      localStorage.removeItem('pps_guardia_hora_inicio');

      alert(
        'Turno finalizado y guardado correctamente.'
      );
      this.router.navigate([
        '/dashboard-jefe'
      ]);
    },
    error: (error: any) => {
      console.error(
        'Error finalizando el turno:',
        error
      );
      alert(
        error.error?.message ||
        'No se pudo finalizar el turno.'
      );
    }
  });
  }

  volver(): void {
    this.router.navigate(['/guardia-activa']);
  }
}
