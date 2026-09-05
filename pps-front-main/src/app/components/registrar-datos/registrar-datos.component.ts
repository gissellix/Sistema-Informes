import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import {
  PersonalTurnoService,
  PersonalDTO,
  PersonalTurno
} from '../../services/personal-turno.service';

import {
  ChoferMovilService,
  ChoferMovilDTO
} from '../../services/chofer-movil.service';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-registrar-datos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-datos.component.html',
  styleUrls: ['./registrar-datos.component.css']
})
export class RegistrarDatosComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  fechaActual: Date = new Date();

  /**
   * Se activa cuando el usuario llega desde la Vista Previa del Informe
   * mediante el botón "Editar Datos". Muestra el banner de contexto de edición.
   */
  modoEdicion: boolean = false;

  // ==========================================
  // BUSCADORES Y LISTADO DE PERSONAL
  // ==========================================
  
  // Inputs de búsqueda
  buscarLegajoPersonal: string = '';
  buscarLegajoChofer: string = '';
  nroMovil: string = '';
  patente: string = '';
  unidadRegionalSeleccionada: string = '';

  listaUnidadesRegionales: string[] = [
    '1-Capital',
    '2-Centro',
    '3-Norte',
    '4-Sur',
    '5-Este',
    '6-Oeste'
  ];

  // Oficiales encontrados por legajo
  personalEncontrado: PersonalDTO | null = null;
  choferEncontrado: any = null;

  // Lista definitiva de oficiales en el turno
  personalTurnoList: PersonalTurno[] = [];

  // Chofer y móvil asignados
  choferAsignado: any = null;

  errorPersonal: string = '';

  // Mock de personal en el sistema (para simular GET en backend)
  mockPersonal = [
    { legajo: '3001', nombre: 'Oficial Inspector Laura Benítez', cargo: 'Oficial de Guardia' },
    { legajo: '3002', nombre: 'Sargento Primero Carlos Martínez', cargo: 'Patrullero Zona Norte' },
    { legajo: '3003', nombre: 'Cabo Primero Sofía Rodríguez', cargo: 'Operador de Despacho' },
    { legajo: '3004', nombre: 'Oficial Ayudante Juan Gómez', cargo: 'Patrullero Zona Sur' },
    { legajo: '4001', nombre: 'Cabo Conductor Diego Silva', cargo: 'Chofer Operativo' },
    { legajo: '4002', nombre: 'Sargento Conductor Marcos Díaz', cargo: 'Chofer de Apoyo' }
  ];

  // ==========================================
  // GRABACIÓN Y AUDIO
  // ==========================================

  // Estados de la grabación: 'inactivo', 'grabando', 'procesando', 'completado'
  recordingState: 'inactivo' | 'grabando' | 'procesando' | 'completado' = 'inactivo';

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
    private personalTurnoService: PersonalTurnoService,
    private choferMovilService: ChoferMovilService,
    private audioService: AudioService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    // Verificar sesión y rol
    if (!this.authService.isAuthenticated() || !this.authService.isJefe()) {
      this.router.navigate(['/login']);
      return;
    }

    // Detectar si se llegó aquí desde la Vista Previa para editar datos del informe
    this.route.queryParams.subscribe(params => {
      this.modoEdicion = params['modo'] === 'edicion';
    });

    // Cargar los datos que pertenecen al turno activo
    this.cargarPersonalDelTurno();
    this.cargarChoferDelTurno();
  }

  private cargarPersonalDelTurno(): void {
  this.personalTurnoService.obtenerPersonalTurno().subscribe({
    next: (personal) => {
      this.personalTurnoList = personal;
      console.log(
        'Personal del turno activo:',
        this.personalTurnoList
      );
    },
    error: (error) => {
      console.error(
        'Error obteniendo personal del turno:',
        error
      );
      this.personalTurnoList = [];
    }
  });
}

  private cargarChoferDelTurno(): void {
    this.choferMovilService.obtenerChoferMovil().subscribe({
      next: (chofer) => {
        this.choferAsignado = chofer;

        console.log(
          'Chofer y móvil del turno activo:',
          this.choferAsignado
        );
      },
      error: (error) => {
        console.log(
          'No hay chofer/móvil asignado al turno activo.'
        );

        this.choferAsignado = null;
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
    this.audioChunks = [];
    this.audioUrl = null;
    this.timerSeconds = 0;

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

        // Liberar micrófono
        stream.getTracks().forEach(track => track.stop());

        // Enviar audio al backend
        this.procesarAudioYTranscribir(audioBlob);
      };

      this.mediaRecorder.start();
      this.recordingState = 'grabando';

      // Iniciar contador de tiempo
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

  private procesarAudioYTranscribir(audioBlob: Blob): void {
    this.recordingState = 'procesando';
    this.audioService.transcribir(audioBlob).subscribe({
      next: (respuesta) => {
        console.log('Transcripción recibida:', respuesta);
        this.transcripcionText = respuesta.transcripcion;
        this.recordingState = 'completado';
      },

      error: (error) => {
        console.error('Error al transcribir el audio:', error);
        this.recordingState = 'inactivo';
        alert(
          'No se pudo transcribir el audio. ' +
          'Verifique que el backend y el servicio de Python estén funcionando.'
        );
      }

    });
  }


  /**
   * Reinicia el estado de grabación para grabar de nuevo
   */
  regrabar(): void {
    this.limpiarTemporizador();
    this.detenerFlujoDeAudio();
    this.audioChunks = [];
    this.audioUrl = null;
    this.transcripcionText = '';
    this.recordingState = 'inactivo';
    this.timerSeconds = 0;
  }

  // ==========================================
  // METODOS DE BUSQUEDA E INTEGRACIÓN
  // ==========================================

  buscarPersonal(): void {
    const legajo = this.buscarLegajoPersonal.trim();

    if (!legajo) {
      alert('Por favor, ingrese el legajo del personal.');
      return;
    }

    this.errorPersonal = '';
    this.personalEncontrado = null;

    this.personalTurnoService.buscarPersonal(legajo).subscribe({
      next: (personal) => {
        this.personalEncontrado = personal;
        console.log('Personal encontrado:', personal);
      },

      error: (error) => {
        console.error('Error buscando personal:', error);
        this.errorPersonal =
          error.error?.message ||
          'No se encontró el personal o no puede ser agregado al turno.';
      }
    });
  }

  agregarPersonal(): void {
    if (!this.personalEncontrado) {
      return;
    }
    const legajo = this.personalEncontrado.legajo;
    this.personalTurnoService.agregarPersonal(legajo).subscribe({
      next: (personalTurno) => {
        console.log('Personal agregado correctamente:', personalTurno);
        this.personalTurnoList.push(personalTurno);
        this.personalEncontrado = null;
        this.buscarLegajoPersonal = '';
        this.errorPersonal = '';
      },
      error: (error) => {
        console.error('ERROR AL AGREGAR PERSONAL:', error);
        alert(
          error.error?.message ||
          'No se pudo agregar el personal al turno.'
        );
      }
    });
  }

  removerPersonal(index: number): void {
    const personal = this.personalTurnoList[index];
    console.log('Personal seleccionado para eliminar:', personal);
    if (!personal) {
      console.error('No se encontró el personal en el índice:', index);
      return;
    }
    const legajo = personal.legajo;
    console.log('Eliminando personal con legajo:', legajo);
    this.personalTurnoService.eliminarPersonal(legajo).subscribe({

      next: () => {
        console.log('Personal eliminado correctamente del backend');

        // Lo elimina también visualmente de la lista
        this.personalTurnoList.splice(index, 1);
      },
      error: (error) => {
        console.error('ERROR AL ELIMINAR PERSONAL:', error);
        alert(
          error.error?.message ||
          'No se pudo eliminar el personal del turno.'
        );
      }
    });
  }

  buscarChofer(): void {
    const legajo = this.buscarLegajoChofer.trim();
    if (!legajo) {
      alert('Por favor, ingrese el legajo del chofer.');
      return;
    }
    console.log('Buscando chofer:', legajo);

    this.choferMovilService.buscarChofer(legajo).subscribe({
      next: (chofer) => {
        console.log('Chofer encontrado:', chofer);
        this.choferEncontrado = chofer;
      },
      error: (error) => {
        console.error('Error buscando chofer:', error);
        this.choferEncontrado = null;
        alert(
          error.error?.message ||
          'No se encontró el chofer con ese legajo.'
        );
      }
    });
  }

  asignarChofer(): void {
    if (!this.choferEncontrado) {
      return;
    }

    if (!this.nroMovil.trim() && !this.patente.trim()) {
      alert('Debe ingresar el número del móvil o la patente.');
      return;
    }

    this.choferMovilService.asignarChofer(
      this.choferEncontrado.legajo,
      this.nroMovil,
      this.patente
    ).subscribe({
      next: (resultado) => {
        console.log('Chofer y móvil asignados:', resultado);
        this.choferAsignado = {
        ...this.choferEncontrado,
        numeroMovil: resultado.numeroMovil || this.nroMovil,
        patente: resultado.patente || this.patente
      };
        this.choferEncontrado = null;
        this.buscarLegajoChofer = '';
        this.nroMovil = '';
        this.patente = '';
      },
      error: (error) => {
        console.error('Error asignando chofer y móvil:', error);
        alert(
          error.error?.message ||
          'No se pudo asignar el chofer y el móvil.'
        );
      }
    });
  }

  removerChofer(): void {
    console.log('Intentando eliminar chofer y móvil...');
    this.choferMovilService.eliminarChoferMovil().subscribe({
      next: () => {
        console.log('Chofer y móvil eliminados correctamente');
        this.choferAsignado = null;
        this.choferEncontrado = null;
        this.buscarLegajoChofer = '';
        this.nroMovil = '';
        this.patente = '';
      },
      error: (error) => {
        console.error('Error eliminando chofer y móvil:', error);
        alert(
          error.error?.message ||
          'No se pudo eliminar el chofer y móvil.'
        );
      }
    });
  }

  // ==========================================
  // METODOS DEL REPORTE
  // ==========================================

  guardarReporte(): void {
    if (!this.unidadRegionalSeleccionada) {
      alert('Debe seleccionar la Unidad Regional.');
      return;
    }
    if (this.personalTurnoList.length === 0) {
      alert('Debe agregar al menos un oficial al personal del turno.');
      return;
    }
    if (!this.choferAsignado) {
      alert('Debe asignar un chofer y un móvil al turno.');
      return;
    }
    if (!this.transcripcionText.trim()) {
      alert('Por favor, grabe un audio o redacte la información del reporte antes de finalizar.');
      return;
    }

    // Guardar en localStorage
    localStorage.setItem('pps_datos_turno', JSON.stringify({
      personal: this.personalTurnoList,
      chofer: this.choferAsignado,
      unidadRegional: this.unidadRegionalSeleccionada,
      observaciones: this.transcripcionText.trim()
    }));

    alert('Datos del turno guardados correctamente para el informe final.');
    this.router.navigate(['/guardia-activa']);
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
