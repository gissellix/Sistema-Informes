import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  legajo: string = '';
  contrasena: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Redireciona si ya esta logeado
    if (this.authService.isAuthenticated()) {
      this.redirectUser();
    }
  }

  onSubmit(): void {
    if (!this.legajo || !this.contrasena) {
      this.errorMessage = 'Por favor, ingrese su legajo y contraseña.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login(this.legajo, this.contrasena).subscribe({
      next: () => {
        this.isLoading = false;
        this.redirectUser();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
        this.errorMessage = 'La cuenta está inhabilitada o los datos son incorrectos.';
      } else {
        this.errorMessage = 'Error de conexión con el servidor.';
      }
    }
    });
  }

  private redirectUser(): void {
    const user = this.authService.getCurrentUser();
    if (user?.rol === 'ROLE_DIRECTIVO') {
      this.router.navigate(['/dashboard-directivo']);
    } else if (user?.rol === 'ROLE_JEFE_POLICIAL') {
      this.router.navigate(['/dashboard-jefe']);
    } else if (user?.rol === 'ROLE_ADMINISTRATIVO') {
      this.router.navigate(['/dashboard-admin']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  quickLogin(role: 'directivo' | 'jefe' | 'admin'): void {
    if (role === 'directivo') {
      this.legajo = '1001';
      this.contrasena = 'directivo123';
    } else if (role === 'jefe') {
      this.legajo = '2002';
      this.contrasena = 'jefe123';
    } else if (role === 'admin') {
      this.legajo = '1234';
      this.contrasena = 'admin';
    }
    this.onSubmit();
  }
}
