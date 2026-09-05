import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { Usuario } from '../../models/usuario.model';
import { PersonalDTO } from '../../models/personal.dto';
import { CrearUsuarioRequest } from '../../models/crear-usuario-request.model';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements OnInit {
  activeTab: 'usuarios' | 'registrar' | 'bloqueados' = 'usuarios';
  currentUser: User | null = null;
  users: Usuario[] = [];
  //officialRegistry: any[] = [];
  
  // Filtros y búsquedas
  searchQuery: string = '';
  filterRole: string = '';
  
  // Registro de nuevo usuario
  searchLegajo: string = '';
  searchedStaff: PersonalDTO | null = null;
  searchError: string = '';
  passwordNewUser: string = '';
  roleNewUser: 'ROLE_DIRECTIVO' | 'ROLE_JEFE_POLICIAL' = 'ROLE_JEFE_POLICIAL';
  
  // Edición de usuario
  showEditModal: boolean = false;
  selectedUserForEdit: Usuario | null = null;
  editNombre: string = '';
  editRol: 'ROLE_DIRECTIVO' | 'ROLE_JEFE_POLICIAL' | 'ROLE_ADMINISTRATIVO' = 'ROLE_JEFE_POLICIAL';
  rolOriginal: string = '';
  editPassword: string = '';
  editActivo: boolean = true;
  editUnidadRegional: string = '';

  // Notificaciones
  notification: { message: string, type: 'success' | 'error' | 'info' } | null = null;
  private notificationTimeout: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated() ||
        !this.authService.isAdmin()) {

      this.router.navigate(['/login']);
      return;
    }
      this.loadUsers();
    }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
        next: (usuarios) => {
          this.users = usuarios;
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.notification = { message, type };
    this.notificationTimeout = setTimeout(() => {
      this.notification = null;
    }, 4000);
  }

  // Filtrado de usuarios
  get filteredUsers(): Usuario[] {
    return this.users.filter(u => {
      // No listar a los admins en la lista de gestión para evitar que se borren o editen a sí mismos por error
      //if (u.rol === 'ROLE_ADMINISTRATIVO') return false;

      // Filtro de rol
      if (this.filterRole && u.rol !== this.filterRole) return false;

      // Búsqueda por legajo
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.trim().toLowerCase();
        return u.legajo.toLowerCase().includes(query) || u.nombre.toLowerCase().includes(query);
      }

      return true;
    });
  }

  get blockedUsers(): Usuario[] {
    return this.users.filter(u => u.bloqueado === true);
  }

  toggleUserStatus(user: Usuario): void {

  const nuevoEstado = user.activo === false;

  const confirmacion = confirm(
    nuevoEstado
      ? `¿Está seguro de habilitar al usuario ${user.nombre}?`
      : `¿Está seguro de inhabilitar al usuario ${user.nombre}?`
    );

  if (!confirmacion) {
    return;
    }

  this.userService.cambiarEstadoUsuario(
    user.legajo,
    nuevoEstado
    ).subscribe({

    next: () => {
      this.showNotification(
        nuevoEstado
          ? 'Usuario habilitado correctamente.'
          : 'Usuario inhabilitado correctamente.',
        'success'
      );
      this.loadUsers();
      },

    error: (error) => {
      console.error('Error cambiando estado:', error);
      this.showNotification(
        'No se pudo cambiar el estado del usuario.',
        'error'
        );
      }
    });
  }

  // Modificar Datos - Abrir Modal
  openEditModal(user: Usuario): void {
    this.selectedUserForEdit = user;
    this.editNombre = user.nombre;

    this.editRol = user.rol as
      'ROLE_DIRECTIVO' |
      'ROLE_JEFE_POLICIAL' |
      'ROLE_ADMINISTRATIVO';

    this.rolOriginal = user.rol; // ← FALTA ESTO

    this.editPassword = '';
    this.editActivo = user.activo !== false;
    this.editUnidadRegional = user.unidadRegional || '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUserForEdit = null;
  }

  saveEdit(): void {
    console.log('========== GUARDAR EDICIÓN ==========');
    console.log('Usuario seleccionado:', this.selectedUserForEdit);
    console.log('ID usuario:', this.selectedUserForEdit?.idUsuario);
    console.log('Rol original:', this.rolOriginal);
    console.log('Rol actual:', this.editRol);
    console.log('Nueva contraseña:', this.editPassword);

    if (!this.selectedUserForEdit) {
      console.log('NO HAY USUARIO SELECCIONADO');
      return;
    }

    const idUsuario = this.selectedUserForEdit.idUsuario;

    const cambioRol = this.editRol !== this.rolOriginal;
    const cambioPassword = this.editPassword.trim() !== '';

    console.log('¿Cambió rol?:', cambioRol);
    console.log('¿Cambió contraseña?:', cambioPassword);

    /*if (!this.selectedUserForEdit) {
      return;
    }

    const idUsuario = this.selectedUserForEdit.idUsuario;

    // Verificar si cambió el rol
    const cambioRol = this.editRol !== this.rolOriginal;

    // Verificar si cambió la contraseña
    const cambioPassword = this.editPassword.trim() !== '';*/

    // Si no cambió nada
    if (!cambioRol && !cambioPassword) {
      this.closeEditModal();
      return;
    }

    // Primero cambiamos el rol si fue modificado
    if (cambioRol) {

      this.userService.cambiarRolUsuario(
        idUsuario,
        this.editRol
      ).subscribe({
        next: () => {
          this.showNotification(
            'Rol modificado correctamente.',
            'success'
          );

          this.loadUsers();
          this.closeEditModal();
        },

        error: (error) => {
          console.error('ERROR COMPLETO:', error);
          console.error('STATUS:', error.status);
          console.error('BODY:', error.error);

          this.showNotification(
            'No se puede cambiar el rol.',
            'error'
          );
        }
      });

      return;
    }

    // Si solamente cambió la contraseña
    if (cambioPassword) {
      this.restablecerPasswordDesdeEdicion(idUsuario);
    }
  }

  private restablecerPasswordDesdeEdicion(idUsuario: number): void {
    console.log('========== RESTABLECER CONTRASEÑA ==========');
    console.log('ID recibido:', idUsuario);
    console.log('Contraseña:', this.editPassword.trim());

    this.userService.restablecerContrasena(
      idUsuario,
      this.editPassword.trim()
    ).subscribe({
      next: (respuesta) => {
        console.log('RESPUESTA DEL BACKEND:', respuesta);
        this.showNotification(
          'Contraseña modificada correctamente.',
          'success'
        );
        this.loadUsers();
        this.closeEditModal();
      },

      error: (error) => {
        console.error('ERROR RESTABLECIENDO CONTRASEÑA:', error);
        console.error('STATUS:', error.status);
        console.error('BODY:', error.error);

        this.showNotification(
          'No se pudo cambiar la contraseña.',
          'error'
        );
        this.loadUsers();
        this.closeEditModal();
      }
    });
  }

  // Eliminar usuario
  deleteUser(user: Usuario): void {
    const confirmacion = confirm(`¿Está seguro de que desea eliminar al usuario ${user.nombre} (${user.legajo})? Esta acción no se puede deshacer.`);
    if (confirmacion) {
      //this.authService.deleteUser(user.legajo);
      this.loadUsers();
      this.showNotification(`Usuario ${user.nombre} eliminado correctamente.`, 'success');
    }
  }

  searchLegajoInRegistry(): void {

  this.searchError = '';
  this.searchedStaff = null;

  const legajo = this.searchLegajo.trim();

  if (!legajo) {
    this.searchError = 'Por favor, ingrese un número de legajo.';
    return;
  }
  this.userService.buscarPersonal(legajo).subscribe({
    next: (personal: PersonalDTO) => {
      this.searchedStaff = personal;
      this.passwordNewUser = '';
    },
    error: (error) => {
      console.error('Error buscando personal:', error);
      if (error.status === 404) {
        this.searchError =
          'No se encontró personal con ese legajo.';
      } else {
        this.searchError =
          'No se pudo consultar el Registro de Personal.';
        }
      }
    });
  }

  addSearchedUser(): void {
    if (!this.searchedStaff) {
      return;
    }

    if (!this.passwordNewUser.trim()) {
      this.showNotification(
        'Por favor, defina una contraseña para la cuenta.',
        'error'
      );
      return;
    }

    const request: CrearUsuarioRequest = {
      legajo: this.searchedStaff.legajo,
      password: this.passwordNewUser.trim(),
      rol: this.roleNewUser
    };

    this.userService.crearUsuario(request).subscribe({
      next: () => {
        this.showNotification(
          `Cuenta para ${this.searchedStaff?.nombreApellido} creada con éxito.`,
          'success'
        );
        this.searchLegajo = '';
        this.searchedStaff = null;
        this.passwordNewUser = '';

        this.activeTab = 'usuarios';

        // Volvemos a consultar los usuarios
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error creando usuario:', error);
        if (error.status === 409) {
          this.showNotification(
            'El personal ya tiene una cuenta de usuario.',
            'error'
          );
        } else {
          this.showNotification(
            'No se pudo crear el usuario.',
            'error'
          );
        }
      }
    });
  }

  // Desbloquear cuentas (dar de alta)
  unblockUser(user: Usuario): void {
    this.userService.desbloquearUsuario(user.idUsuario).subscribe({
      next: (respuesta) => {
        console.log('RESPUESTA DEL BACKEND:', respuesta);

        this.showNotification(
          `La cuenta del legajo ${user.legajo} fue desbloqueada correctamente.`,
          'success'
        );
        this.loadUsers();
      },

      error: (error) => {
        console.error('========== ERROR ==========');
        console.error('STATUS:', error.status);
        console.error('ERROR:', error.error);
        console.error('MESSAGE:', error.message);
        console.error('===========================');

        this.showNotification(
          'No se pudo desbloquear el usuario.',
          'error'
        );
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
