import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { jsPDF } from 'jspdf';
import {
  InformeDirectivoService,
  BusquedaInformeDTO,
  InformeDTO,
  PuntoGpsDTO
} from '../../services/informe-directivo.service';

// Declaración global para Leaflet, cargado vía CDN en index.html
declare var L: any;

@Component({
  selector: 'app-dashboard-directivo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-directivo.component.html',
  styleUrls: ['./dashboard-directivo.component.css']
})
export class DashboardDirectivoComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  reports: BusquedaInformeDTO[] = [];
  selectedReport: InformeDTO | null = null;

  // ==========================================
  // FILTROS
  // ==========================================
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  filtroUnidadRegional: string = '';
  filtroLegajoJefe: string = '';

  unidadesRegionales: string[] = [
    '1-Capital',
    '2-Centro',
    '3-Norte',
    '4-Sur',
    '5-Este',
    '6-Oeste'
  ];

  // ==========================================
  // ESTADOS DE MODALES
  // ==========================================
  mostrarDetalleModal: boolean = false;
  mostrarMapModal: boolean = false;

  // Instancia del mapa Leaflet
  private map: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private informeService: InformeDirectivoService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    if (
      !this.authService.isAuthenticated() ||
      !this.authService.isDirectivo()
    ) {
      this.router.navigate(['/login']);
      return;
    }
    this.buscarInformes();
  }

  ngOnDestroy(): void {
    this.limpiarMapa();
  }

  buscarInformes(): void {
    this.informeService.obtenerInformes(
      this.filtroFechaInicio || undefined,
      this.filtroFechaFin || undefined,
      this.filtroUnidadRegional || undefined,
      this.filtroLegajoJefe.trim() || undefined
    ).subscribe({
      next: (data) => {
        this.reports = data;
      },
      error: (error) => {
        console.error('Error buscando informes:', error);
      }
    });
  }

  /**
   * Limpia todos los filtros aplicados
   */
  limpiarFiltros(): void {
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.filtroUnidadRegional = '';
    this.filtroLegajoJefe = '';
    this.buscarInformes();
  }

  /**
   * Abre el modal para visualizar los detalles del reporte
   */
  verDetalle(idInforme: number): void {
    this.informeService.obtenerDetalle(idInforme).subscribe({
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

  /**
   * Abre el modal del mapa interactivo e inicializa la ruta GPS con Leaflet
   */
  verRecorridoGps(idInforme: number): void {
    this.informeService.obtenerDetalle(idInforme).subscribe({
      next: (informe) => {
        this.selectedReport = informe;
        this.mostrarMapModal = true;
        setTimeout(() => {
          this.inicializarMapa(informe);
        }, 150);
      },
      error: (error) => {
        console.error('Error obteniendo recorrido GPS:', error);
      }
    });
  }

  cerrarMapModal(): void {
    this.limpiarMapa();
    this.mostrarMapModal = false;
    this.selectedReport = null;
  }

  /**
   * Inicializa Leaflet Map y dibuja la polilínea con marcas de inicio y fin del patrullaje.
   */
  private inicializarMapa(reporte: InformeDTO): void {
    this.limpiarMapa();

    const recorrido = reporte.recorridoGps || [];
    if (recorrido.length === 0) {
      return;
    }

    const startPoint = recorrido[0];
    const endPoint = recorrido[recorrido.length - 1];

    // Crear mapa Leaflet
    this.map = L.map('map-canvas').setView([startPoint.lat, startPoint.lng], 14);

    // Cargar capa de baldosas de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    // Mapear coordenadas a formato de Leaflet
    const latLngs = recorrido.map((p: PuntoGpsDTO) => [p.lat, p.lng]);

    // Dibujar la línea del patrullaje (Polyline) con color Cyan
    const polyline = L.polyline(latLngs, {
      color: '#06b6d4',
      weight: 5,
      opacity: 0.8,
      dashArray: '5, 10' // Estilo de patrullaje policial discontinuo
    }).addTo(this.map);

    // Iconos personalizados para inicio y fin de guardia
    const startIcon = L.divIcon({
      className: 'custom-map-icon icon-start',
      html: `<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>`,
      iconSize: [12, 12]
    });

    const endIcon = L.divIcon({
      className: 'custom-map-icon icon-end',
      html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>`,
      iconSize: [12, 12]
    });

    // Agregar marcador del punto inicial
    L.marker([startPoint.lat, startPoint.lng], { icon: startIcon })
      .addTo(this.map)
      .bindPopup(`<b>Punto de Inicio</b><br>${new Date(startPoint.timestamp).toLocaleTimeString('es-AR')} hs`)
      .openPopup();

    // Agregar marcador del punto final
    L.marker([endPoint.lat, endPoint.lng], { icon: endIcon })
      .addTo(this.map)
      .bindPopup(`<b>Punto de Finalización</b><br>${new Date(endPoint.timestamp).toLocaleTimeString('es-AR')} hs`);

    // Ajustar zoom y encuadre a todo el recorrido registrado
    this.map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    // Corrección para refrescar el layout del mapa en modales que cargan asíncronamente
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  }

  private limpiarMapa(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
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

  /**
   * Genera y descarga el reporte en formato PDF usando el formato oficial de Jujuy
   */
  descargarPDF(idInforme: number): void {
    this.informeService.descargarInforme(idInforme).subscribe({
      next: (informe) => {
        this.generarPDF(informe);
      },
      error: (error) => {
        console.error('Error obteniendo informe:', error);
      }
    });
  }

  private generarPDF(informe: InformeDTO): void {
    const doc = new jsPDF();
    const altoPagina = doc.internal.pageSize.height;
    const continuarPDF = () => {
      this.construirContenidoPDF(doc, informe, altoPagina);
    };
    // Intentar cargar el escudo
    const img = new Image();
    img.onload = () => {
      doc.addImage(img, 'PNG', 20, 15, 20, 20);
      continuarPDF();
    };
    img.onerror = () => {
      console.warn('No se pudo cargar escudo.png');
      this.drawLogoPlaceholder(doc, 20, 15, 20);
      continuarPDF();
    };
    img.src = 'escudo.png';
  }

  private construirContenidoPDF(
    doc: jsPDF,
    informe: InformeDTO,
    altoPagina: number
  ): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    doc.text(
      'POLICIA DE LA PROVINCIA DE JUJUY',
      45,
      25
    );
    doc.setFontSize(7);
    doc.text(
      'S. S. DE JUJUY',
      45,
      29
    );

    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(
      'INFORME COMISARIO DE SERVICIO',
      190,
      27,
      { align: 'right' }
    );

    // Línea separadora
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(
      20,
      39,
      190,
      39
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    const fechaInicio = this.formatearFechaPDF(
      informe.fechaInicio
    );
    const fechaFin = this.formatearFechaPDF(
      informe.fechaFin
    );
    let rangoFecha = fechaInicio;
    if (
      informe.fechaFin &&
      informe.fechaFin !== informe.fechaInicio
    ) {
      rangoFecha = `${fechaInicio} - ${fechaFin}`;
    }
    doc.text(
      `Fecha: ${rangoFecha}`,
      20,
      46
    );
    doc.text(
      `Unidad Regional: ${informe.unidadRegional || 'No especificada'}`,
      190,
      46,
      { align: 'right' }
    );
    let y = 53;

    // Encabezado
    doc.setFillColor(241, 245, 249);

    doc.rect(
      20,
      y,
      125,
      7,
      'F'
    );
    doc.rect(
      20,
      y,
      125,
      7,
      'S'
    );
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text('Rol', 22, y + 4.5);
    doc.text('Jerarquía', 54, y + 4.5);
    doc.text('Legajo', 79, y + 4.5);
    doc.text('Apellido y nombre', 96, y + 4.5);

    doc.line(52, y, 52, y + 7);
    doc.line(77, y, 77, y + 7);
    doc.line(94, y, 94, y + 7);
    doc.rect(
      152,
      y,
      38,
      7,
      'F'
    );
    doc.rect(
      152,
      y,
      38,
      7,
      'S'
    );
    doc.text(
      'MOVIL',
      171,
      y + 4.5,
      { align: 'center' }
    );
    y += 7;
    const rows: {
      rol: string;
      jerarquia: string;
      legajo: string;
      nombre: string;
    }[] = [];

    // Jefe
    rows.push({
      rol: informe.rolJefe || 'JEFE DE GUARDIA',
      jerarquia: informe.jerarquiaJefe || '',
      legajo: informe.legajoJefe || '',
      nombre: (
        informe.nombreApellidoJefe || ''
      ).toUpperCase()
    });

    // Chofer
    if (
      informe.legajoChofer ||
      informe.nombreApellidoChofer
    ) {
      rows.push({
        rol: informe.rolChofer || 'CHOFER',
        jerarquia: informe.jerarquiaChofer || '',
        legajo: informe.legajoChofer || '',
        nombre: (
          informe.nombreApellidoChofer || ''
        ).toUpperCase()
      });
    }

    // Personal de turno
    if (informe.personalTurnoList) {

      informe.personalTurnoList.forEach(
        (p) => {

          rows.push({
            rol: 'PERSONAL DE TURNO',
            jerarquia: p.jerarquia || '',
            legajo: p.legajo || '',
            nombre: (
              `${p.apellido} ${p.nombre}`
            ).toUpperCase()
          });

        }
      );
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);

    const totalRows = Math.max(
      rows.length,
      3
    );
    for (
      let idx = 0;
      idx < totalRows;
      idx++
    ) {
      const fila = rows[idx];

      // Tabla personal
      doc.rect(
        20,
        y,
        125,
        7
      );
      if (fila) {
        doc.text(
          fila.rol,
          22,
          y + 4.5
        );
        doc.text(
          fila.jerarquia,
          54,
          y + 4.5
        );
        doc.text(
          fila.legajo,
          79,
          y + 4.5
        );
        doc.text(
          fila.nombre,
          96,
          y + 4.5
        );
      }
      doc.line(
        52,
        y,
        52,
        y + 7
      );
      doc.line(
        77,
        y,
        77,
        y + 7
      );
      doc.line(
        94,
        y,
        94,
        y + 7
      );
      doc.rect(
        152,
        y,
        38,
        7
      );
      if (idx === 0) {

        doc.setFont(
          'helvetica',
          'bold'
        );
        doc.text(
          informe.numeroMovil || '-',
          171,
          y + 4.5,
          { align: 'center' }
        );
        doc.setFont(
          'helvetica',
          'normal'
        );
      } else if (idx === 1) {
        doc.setFillColor(
          241,
          245,
          249
        );
        doc.rect(
          152,
          y,
          38,
          7,
          'F'
        );
        doc.rect(
          152,
          y,
          38,
          7,
          'S'
        );
        doc.setFont(
          'helvetica',
          'bold'
        );
        doc.text(
          'PATENTE',
          171,
          y + 4.5,
          { align: 'center' }
        );
        doc.setFont(
          'helvetica',
          'normal'
        );
      } else if (idx === 2) {
        doc.text(
          informe.patente || '-',
          171,
          y + 4.5,
          { align: 'center' }
        );
      }
      y += 7;
    }
    y += 10;
    doc.setFont(
      'helvetica',
      'bold'
    );
    doc.setFontSize(10.5);
    doc.setTextColor(
      15,
      23,
      42
    );
    doc.text(
      'NOVEDADES',
      20,
      y
    );
    y += 4;
    doc.setDrawColor(
      6,
      182,
      212
    );
    doc.setLineWidth(0.8);
    doc.line(
      20,
      y,
      190,
      y
    );
    y += 8;
    doc.setFont(
      'helvetica',
      'normal'
    );
    doc.setFontSize(9);
    doc.setTextColor(
      30,
      41,
      59
    );
    if (
      informe.novedades &&
      informe.novedades.length > 0
    ) {
      informe.novedades.forEach(
        (novedad) => {
          if (
            y >
            altoPagina - 25
          ) {
            doc.addPage();
            y = 25;
          }
          const fechaNovedad =
            this.formatearFechaPDF(
              novedad.fechaHora
            );
          const texto =
            `${novedad.tipo || 'General'} - ` +
            `${novedad.descripcion || ''} ` +
            `(${fechaNovedad})`;
          const lineas =
            doc.splitTextToSize(
              texto,
              170
            );
          lineas.forEach(
            (linea: string) => {
              if (
                y >
                altoPagina - 25
              ) {
                doc.addPage();
                y = 25;
              }
              doc.text(
                linea,
                20,
                y
              );
              y += 5.5;
            }
          );
          y += 2.5;
        }
      );
    } else {
      doc.text(
        'No se registraron novedades.',
        20,
        y
      );
      y += 6;
    }
    if (
      y >
      altoPagina - 40
    ) {
      doc.addPage();
      y = 30;
    }
    y += 15;
    doc.setDrawColor(
      203,
      213,
      225
    );
    doc.setLineWidth(0.5);
    doc.line(
      70,
      y,
      140,
      y
    );
    y += 5;
    doc.setFont(
      'helvetica',
      'bold'
    );
    doc.setFontSize(8.5);
    doc.setTextColor(
      100,
      116,
      139
    );
    doc.text(
      'Firma y Aclaración del Comisario de Servicio',
      105,
      y,
      { align: 'center' }
    );

    y += 5;

    doc.setFont(
      'helvetica',
      'normal'
    );
    doc.setFontSize(7.5);
    doc.text(
      `Fecha de Descarga: ${new Date().toLocaleString('es-AR')}`,
      105,
      y,
      { align: 'center' }
    );
    doc.save(
      `informe_directivo_${informe.idInforme}.pdf`
    );
  }

  private formatearFechaPDF(
    fecha: string
  ): string {

    if (!fecha) {
      return '';
    }
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      return fecha;
    }
    return date.toLocaleString(
      'es-AR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
