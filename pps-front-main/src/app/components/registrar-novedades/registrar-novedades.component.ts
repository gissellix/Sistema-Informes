import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import {
  NovedadService,
  NovedadDTO
} from '../../services/novedad-service';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-registrar-novedades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-novedades.component.html',
  styleUrls: ['./registrar-novedades.component.css']
})
export class RegistrarNovedadesComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  fechaActual: Date = new Date();

  /**
   * Se activa cuando el usuario llega desde la Vista Previa del Informe
   * mediante el botón "Editar Novedades". Muestra el banner de contexto de edición.
   */
  modoEdicion: boolean = false;

  // Estados de la grabación: 'inactivo', 'grabando', 'procesando', 'completado'
  recordingState: 'inactivo' | 'grabando' | 'procesando' | 'completado' = 'inactivo';
  novedadesList: NovedadDTO[] = [];
  latitud: number | null = null;
  longitud: number | null = null;

  // Selección de tipo de novedad
  tipoNovedadSeleccionado: string = '';
  nroSeccionalSeleccionado: string = '';
  horaNovedad: string = '';

  listaTiposNovedad: string[] = [
    'Constancia',
    'Seccional',
    'Vigilancia',
    'Finalizacion de servicio'
  ];

  listaSeccionales: string[] = [
    '1ª', '2ª', '3ª', '4ª', '5ª',
    '6ª', '7ª', '8ª', '9ª', '10ª'
  ];

  // Texto de la transcripción
  transcripcionText: string = '';

  // URL del audio grabado para reproducción local
  audioUrl: string | null = null;

  // Temporizador de grabación
  timerSeconds: number = 0;
  private timerInterval: any = null;

  // Web Audio / MediaRecorder API
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private novedadService: NovedadService,
    private audioService: AudioService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated() || !this.authService.isJefe()) {
      this.router.navigate(['/login']);
      return;
    }

    this.route.queryParams.subscribe(params => {
      this.modoEdicion = params['modo'] === 'edicion';
    });

    this.establecerHoraActual();

    this.cargarNovedades();
  }

  cargarNovedades(): void {
    this.novedadService.obtenerNovedades().subscribe({
      next: (novedades: NovedadDTO[]) => {
        this.novedadesList = novedades;
      },
      error: (error: any) => {
        console.error('Error cargando novedades:', error);
        alert('No se pudieron cargar las novedades del turno.');
      }
    });
  }

  /**
   * Navega de vuelta a la Vista Previa del Informe.
   * Método público para poder ser llamado desde el template HTML.
   */
  volverAlInforme(): void {
    this.router.navigate(['/vista-previa-informe']);
  }

  establecerHoraActual(): void {
    const now = new Date();
    const hrs = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    this.horaNovedad = `${hrs}:${mins}`;
  }

  eliminarNovedad(id: number): void {
    if (!id) {
      return;
    }
    this.novedadService.eliminarNovedad(id).subscribe({
      next: () => {
        console.log('Novedad eliminada correctamente');
        this.novedadesList =
          this.novedadesList.filter(
            n => n.idNovedad !== id
          );
      },
      error: (error: any) => {
        console.error('Error eliminando novedad:', error);
        alert(
          error.error?.message ||
          'No se pudo eliminar la novedad.'
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.limpiarTemporizador();
    this.detenerFlujoDeAudio();
  }

  getFechaFormateada(): string {
    return this.fechaActual.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTimerFormateado(): string {
    const mins = Math.floor(this.timerSeconds / 60);
    const secs = this.timerSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Inicia la captura de audio utilizando la API MediaRecorder del navegador
   */
  async comenzarGrabacion(): Promise<void> {
    if (!this.tipoNovedadSeleccionado) {
      alert('Debe elegir el tipo de novedad antes de comenzar a grabar.');
      return;
    }
    if (this.tipoNovedadSeleccionado === 'Seccional' && !this.nroSeccionalSeleccionado) {
      alert('Debe elegir el número de Seccional antes de comenzar a grabar.');
      return;
    }

    this.audioChunks = [];
    this.audioUrl = null;
    this.timerSeconds = 0;
    this.obtenerUbicacion();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('El navegador no soporta grabación de audio o requiere HTTPS.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(
          this.audioChunks,
          { type: 'audio/webm' }
        );
        this.audioUrl = URL.createObjectURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        this.procesarAudioYTranscribir(audioBlob);
      };

      this.mediaRecorder.start();
      this.recordingState = 'grabando';
      
      this.timerInterval = setInterval(() => {
        this.timerSeconds++;
      }, 1000);

    } catch (error: any) {
        console.error(
          'Error al acceder al micrófono:',
          error
        );

        alert(
          'No se pudo acceder al micrófono. ' +
          'Verifique los permisos del navegador.'
        );

        this.recordingState = 'inactivo';
      }
  }

  /**
   * Detiene el MediaRecorder
   */
  detenerGrabacion(): void {
    this.limpiarTemporizador();
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  /**
   * Simula el proceso de transcripción de novedades
   * NOTA PARA INTEGRACIÓN CON BACKEND:
   * Conectar con POST /api/novedades/transcribir
   */
  private procesarAudioYTranscribir(audioBlob: Blob): void {
    this.recordingState = 'procesando';
    this.audioService.transcribir(audioBlob).subscribe({
      next: (respuesta) => {
        console.log(
          'Transcripción de novedad recibida:',
          respuesta
        );

        this.transcripcionText =
          respuesta.transcripcion;

        this.recordingState = 'completado';
      },

      error: (error) => {
        console.error(
          'Error al transcribir la novedad:',
          error
        );
        this.recordingState = 'inactivo';
        alert(
          'No se pudo transcribir el audio. ' +
          'Verifique que el backend y el servicio de Python estén funcionando.'
        );
      }
    });
  }

  regrabar(): void {
    this.limpiarTemporizador();
    this.detenerFlujoDeAudio();
    this.audioChunks = [];
    this.audioUrl = null;
    this.transcripcionText = '';
    this.recordingState = 'inactivo';
    this.timerSeconds = 0;
    this.tipoNovedadSeleccionado = '';
    this.nroSeccionalSeleccionado = '';
    this.establecerHoraActual();
  }

  /**
   * Guarda las novedades definitivas redactadas/modificadas por el usuario
   * NOTA PARA INTEGRACIÓN CON BACKEND:
   * Conectar con POST /api/guardias/novedades
   */
  guardarReporte(): void {
    if (!this.tipoNovedadSeleccionado) {
      alert('Por favor, seleccione el tipo de novedad antes de guardar.');
      return;
    }

    if (
      this.tipoNovedadSeleccionado === 'Seccional' &&
      !this.nroSeccionalSeleccionado
    ) {
      alert('Por favor, seleccione el número de Seccional.');
      return;
    }

    if (!this.transcripcionText.trim()) {
      alert('Por favor, grabe un audio o redacte la novedad antes de guardar.');
      return;
    }

    let tipoTexto = this.tipoNovedadSeleccionado;

    if (this.tipoNovedadSeleccionado === 'Seccional') {
      tipoTexto = `Seccional N° ${this.nroSeccionalSeleccionado}`;
    }

    const nuevaNovedad: NovedadDTO = {
      tipo: tipoTexto,
      descripcion: this.transcripcionText.trim(),
      latitud: this.latitud ?? undefined,
      longitud: this.longitud ?? undefined
    };

    console.log('Enviando novedad al backend:', nuevaNovedad);

    this.novedadService.registrarNovedad(nuevaNovedad).subscribe({
      next: (novedad) => {
        console.log('Novedad guardada correctamente:', novedad);
        this.novedadesList.push(novedad);
        alert('Novedad guardada correctamente.');
        this.regrabar();
      },

      error: (error: any) => {
        console.error('Error guardando novedad:', error);
        alert(
          error.error?.message ||
          'No se pudo guardar la novedad.'
        );
      }
    });
  }


  obtenerUbicacion(): void {
    if (!navigator.geolocation) {
      console.warn('El navegador no soporta geolocalización.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.latitud = position.coords.latitude;
        this.longitud = position.coords.longitude;
        console.log('Ubicación obtenida:', {
          latitud: this.latitud,
          longitud: this.longitud
        });
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        this.latitud = null;
        this.longitud = null;
      }
    );
  }

  cancelar(): void {
    this.router.navigate(['/guardia-activa']);
  }

  private limpiarTemporizador(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private detenerFlujoDeAudio(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }
  }
}
