import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { jsPDF } from 'jspdf';
import { TurnoService, Turno } from '../../services/turno.service';
import {
  InformeService,
  MisInformesDTO
} from '../../services/informe-service';

@Component({
  selector: 'app-dashboard-jefe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-jefe.component.html',
  styleUrls: ['./dashboard-jefe.component.css']
})
export class DashboardJefeComponent implements OnInit {
  currentUser: User | null = null;
  turnoActivo: Turno | null = null;
  legajoPersonal: string = '';


  iniciarTurno(): void {
    if (this.guardiaActiva && this.turnoActivo) {
      console.log(
        'Ya existe un turno activo. Ingresando al turno...'
      );
      this.router.navigate(['/guardia-activa']);
      return;
    }
    console.log('No hay turno activo. Iniciando uno nuevo...');
    this.turnoService.iniciarTurno().subscribe({
      next: (turno) => {
        console.log(
          'Turno iniciado correctamente:',
          turno
        );
        this.turnoActivo = turno;
        this.guardiaActiva = true;
        localStorage.setItem(
          'pps_guardia_activa',
          'true'
        );
        this.router.navigate([
          '/guardia-activa'
        ]);
      },
      error: (error) => {
        console.error(
          'ERROR AL INICIAR TURNO:',
          error
        );
        alert(
          error.error?.message ||
          'No se pudo iniciar el turno.'
        );
      }
    });
  }

  irAGuardiaActiva(): void {
    this.router.navigate(['/guardia-activa']);
  }

  // ==========================================
  // CONTROL DE GUARDIA / SHIFT CONTROLS
  // ==========================================

  // El estado de guardia persiste en localStorage para que al volver
  // de la pantalla guardia-activa el indicador siga activo.
  guardiaActiva: boolean = false;
  mostrarInformesPopup: boolean = false;
  mostrarLogoutConfirm: boolean = false;
  
  mostrarDetalleModal: boolean = false;
  selectedReport: any = null;

  misInformes: MisInformesDTO[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private turnoService: TurnoService,
    private informeService: InformeService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.cargarEstadoTurno();
    this.cargarInformes();

    this.route.queryParams.subscribe(params => {
      if (params['mostrarInformes'] === 'true') {
        this.mostrarInformesPopup = true;
      }
    });
  }

  cargarEstadoTurno(): void {
    this.turnoService.obtenerTurnoActivo().subscribe({
      next: (turno) => {
        console.log(
          'Turno activo encontrado:',
          turno
        );
        this.turnoActivo = turno;
        this.guardiaActiva = true;
      },
      error: (error) => {
        console.log(
          'No hay turno activo.'
        );
        this.turnoActivo = null;
        this.guardiaActiva = false;
      }
    });
  }

  cargarInformes(): void {
    console.log('Cargando informes desde el backend...');
    this.informeService.obtenerMisInformes().subscribe({
      next: (informes: MisInformesDTO[]) => {
        console.log('Informes recibidos desde backend:', informes);
        this.misInformes = informes;
      },
      error: (error: any) => {
        console.error(
          'Error cargando informes:',
          error
        );
        this.misInformes = [];
        alert(
          error.error?.message ||
          'No se pudieron cargar los informes.'
        );
      }
    });
  }

  descargarInforme(id: number): void {
    console.log('Obteniendo informe completo:', id);
    this.informeService.descargarInforme(id).subscribe({
      next: (informe) => {
        console.log('Informe completo recibido:', informe);
        this.descargarPDF(informe);
      },
      error: (error: any) => {
        console.error('Error obteniendo informe:', error);
        alert(
          error.error?.message ||
          'No se pudo obtener el informe.'
        );
      }
    });
  }

  toggleInformesPopup(): void {
    this.mostrarInformesPopup = !this.mostrarInformesPopup;
  }

  verDetalle(idInforme: number): void {
    this.informeService.descargarInforme(idInforme).subscribe({
      next: (informe) => {
        this.selectedReport = informe;
        this.mostrarDetalleModal = true;
      },
      error: (error) => {
        console.error('Error obteniendo detalle:', error);
      }
    });
  }

  cerrarDetalleModal(): void {
    this.mostrarDetalleModal = false;
    this.selectedReport = null;
  }

  confirmarLogout(): void {
    this.mostrarLogoutConfirm = true;
  }

  cancelarLogout(): void {
    this.mostrarLogoutConfirm = false;
  }

  /**
   * Dibuja un círculo marcador de posición del escudo oficial
   */
  private drawLogoPlaceholder(doc: any, x: number, y: number, size: number): void {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.circle(x + size / 2, y + size / 2, size / 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text('ESCUDO', x + size / 2, y + size / 2 + 1, { align: 'center' });
  }

  private cargarImagen(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
      img.src = url;
    });
  }

  async descargarPDF(rep: any): Promise<void> {
    const doc = new jsPDF();
    const altoPagina = doc.internal.pageSize.height;

    // 1. DIBUJAR ESCUDO (U IMAGEN DE RECTORIA)
    try {
      const img = await this.cargarImagen('escudo.png');
      doc.addImage(img, 'PNG', 20, 15, 20, 20);
    } catch (e) {
      console.error('Error insertando logotipo en PDF:', e);
      this.drawLogoPlaceholder(doc, 20, 15, 20);
    }

    // Subtítulo policial
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('POLICIA DE LA PROVINCIA DE JUJUY', 45, 25);
    doc.setFontSize(7);
    doc.text('S. S. DE JUJUY', 45, 29);

    // Título Principal (INFORME COMISARIO DE SERVICIO)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('INFORME COMISARIO DE SERVICIO', 190, 27, { align: 'right' });

    // Línea separadora
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1.0);
    doc.line(20, 39, 190, 39);

    // 2. FILA DE FECHA Y UNIDAD REGIONAL
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);

    const fechaRango = rep.fechaRangoFormateada || rep.fecha || '26 a 26 de Julio de 2026';
    const unidadReg = rep.unidadRegional || 'No especificada';

    doc.text(`Fecha: ${fechaRango}`, 20, 46);
    doc.text(`Unidad Regional: ${unidadReg}`, 190, 46, { align: 'right' });

    // 3. TABLAS PARALELAS (LADO A LADO)
    let y = 53;

    // Encabezado Tabla Personal
    doc.setFillColor(241, 245, 249);
    doc.rect(20, y, 125, 7, 'F');
    doc.rect(20, y, 125, 7, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Rol', 22, y + 4.5);
    doc.text('Jerarquía', 54, y + 4.5);
    doc.text('Legajo', 79, y + 4.5);
    doc.text('Apellido y nombre', 96, y + 4.5);

    doc.line(52, y, 52, y + 7);
    doc.line(77, y, 77, y + 7);
    doc.line(94, y, 94, y + 7);

    // Encabezado Tabla Móvil
    doc.rect(152, y, 38, 7, 'F');
    doc.rect(152, y, 38, 7, 'S');
    doc.text('MOVIL', 171, y + 4.5, { align: 'center' });

    y += 7;

    // Filas de datos
    const rows = [];
    rows.push({
      rol: 'COMISARIO DE SERVICIO',
      jerarquia: 'Sub Comisario',
      legajo: rep.jefeLegajo || '13307',
      nombre: (rep.jefeNombre || 'NESTOR MARTIN SOTELO MAMA').toUpperCase()
    });

    const choferInfo = rep.chofer || { legajo: '19780', nombre: 'LISANDRO ABAN', cargo: 'Sargento', movil: 'X-42', legajoMovil: '904' };
    rows.push({
      rol: 'CHOFER',
      jerarquia: choferInfo.cargo || 'Sargento',
      legajo: choferInfo.legajo || '19780',
      nombre: (choferInfo.nombre || 'LISANDRO ABAN').toUpperCase()
    });

    const pers = rep.personal || [];
    pers.forEach((p: any) => {
      rows.push({
        rol: 'PERSONAL DE TURNO',
        jerarquia: p.cargo || 'Oficial',
        legajo: p.legajo,
        nombre: p.nombre.toUpperCase()
      });
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);

    const totalRows = Math.max(rows.length, 3);
    for (let idx = 0; idx < totalRows; idx++) {
      // Dibujar celda personal
      const pRow = rows[idx];
      doc.rect(20, y, 125, 7);
      if (pRow) {
        doc.text(pRow.rol, 22, y + 4.5);
        doc.text(pRow.jerarquia, 54, y + 4.5);
        doc.text(pRow.legajo, 79, y + 4.5);
        doc.text(pRow.nombre, 96, y + 4.5);
      }
      doc.line(52, y, 52, y + 7);
      doc.line(77, y, 77, y + 7);
      doc.line(94, y, 94, y + 7);

      // Dibujar celda móvil
      doc.rect(152, y, 38, 7);
      if (idx === 0) {
        doc.setFont('helvetica', 'bold');
        doc.text(choferInfo.movil || 'X-42', 171, y + 4.5, { align: 'center' });
        doc.setFont('helvetica', 'normal');
      } else if (idx === 1) {
        doc.setFillColor(241, 245, 249);
        doc.rect(152, y, 38, 7, 'F');
        doc.rect(152, y, 38, 7, 'S');
        doc.setFont('helvetica', 'bold');
        doc.text('LEGAJO', 171, y + 4.5, { align: 'center' });
        doc.setFont('helvetica', 'normal');
      } else if (idx === 2) {
        doc.text(choferInfo.legajoMovil || '904', 171, y + 4.5, { align: 'center' });
      }

      y += 7;
    }

    y += 10;

    // 4. SECCIÓN NOVEDADES
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('NOVEDADES', 20, y);
    y += 4;

    doc.setDrawColor(6, 182, 212); // Acento Cyan
    doc.setLineWidth(0.8);
    doc.line(20, y, 190, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    if (rep.novedadesList && rep.novedadesList.length > 0) {
      rep.novedadesList.forEach((nov: any) => {
        if (y > altoPagina - 25) {
          doc.addPage();
          y = 25;
        }

        const novedadStr = `${nov.tipo || 'General'} - ${nov.texto}`;
        const lines = doc.splitTextToSize(novedadStr, 170);
        lines.forEach((line: string) => {
          if (y > altoPagina - 25) {
            doc.addPage();
            y = 25;
          }
          doc.text(line, 20, y);
          y += 5.5;
        });
        y += 2.5; // Espacio entre novedades
      });
    } else {
      // Fallback
      const lineasTexto = doc.splitTextToSize(rep.novedades || '', 170);
      lineasTexto.forEach((linea: string) => {
        if (y > altoPagina - 25) {
          doc.addPage();
          y = 25;
        }
        doc.text(linea, 20, y);
        y += 5.5;
      });
    }

    // Firma en el pie de página
    if (y > altoPagina - 40) {
      doc.addPage();
      y = 30;
    }

    y += 15;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(70, y, 140, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Firma y Aclaración del Comisario de Servicio', 105, y, { align: 'center' });

    doc.save(`informe_policial_${rep.id}.pdf`);
  }

  logout(): void {
    // Limpia también el estado de guardia al cerrar sesión
    localStorage.removeItem('pps_guardia_activa');
    localStorage.removeItem('pps_guardia_fecha_inicio');
    localStorage.removeItem('pps_guardia_hora_inicio');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
