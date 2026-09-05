import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { AuthResponse } from '../models/auth-response.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // BehaviorSubject to maintain the current user state across components reactively.
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private defaultUsers: User[] = [
    {
      legajo: '1001',
      contrasena: 'directivo123',
      nombre: 'Comisario Gral. Eduardo Sanchez',
      rol: 'ROLE_DIRECTIVO',
      unidadRegional: '3-Norte',
      activo: true,
      bloqueado: false
    },
    {
      legajo: '2002',
      contrasena: 'jefe123',
      nombre: 'Jefe de guardia Pablo Gómez',
      rol: 'ROLE_JEFE_POLICIAL',
      unidadRegional: '1-Capital',
      activo: true,
      bloqueado: false
    },
    {
      legajo: '1234',
      contrasena: 'admin',
      nombre: 'Administrador del Sistema',
      rol: 'ROLE_ADMINISTRATIVO',
      unidadRegional: 'Servicio Central',
      activo: true,
      bloqueado: false
    },
    {
      legajo: '9999',
      contrasena: 'bloqueado123',
      nombre: 'Oficial Inspector Javier Peralta',
      rol: 'ROLE_JEFE_POLICIAL',
      unidadRegional: '2-Centro',
      activo: true,
      bloqueado: true
    }
  ];

  private officialRegistry = [
    { legajo: '3003', nombre: 'Subcomisario Laura Rodriguez', jerarquia: 'directivo', unidadRegional: '2-Centro' },
    { legajo: '4004', nombre: 'Oficial Principal Martin Silva', jerarquia: 'jefe', unidadRegional: '4-Sur' },
    { legajo: '5005', nombre: 'Sargento Ayudante Carlos Perez', jerarquia: 'jefe', unidadRegional: '5-Este' },
    { legajo: '6006', nombre: 'Comisario Inspector Ana Martinez', jerarquia: 'directivo', unidadRegional: '6-Oeste' }
  ];

  constructor(private http: HttpClient) {
    this.loadSession();
  }

  /**
   * Initializes the simulated database in localStorage if it doesn't exist
   */
  private initUserDatabase(): void {
    const stored = localStorage.getItem('pps_user_accounts');
    if (!stored) {
      localStorage.setItem('pps_user_accounts', JSON.stringify(this.defaultUsers));
    }
  }

  /**
   * Restores session from localStorage if it exists
   */
  private loadSession(): void {
    const token = localStorage.getItem('pps_token');
    const userJson = localStorage.getItem('pps_user');
    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (e) {
        this.logout();
      }
    }
  }

  /**
   * Authenticate user.
   */
  public login(legajo: string, contrasena: string): Observable<AuthResponse> {

    if (!legajo || !contrasena) {
      return throwError(() => new Error('Por favor, complete todos los campos.'));
    }

    const loginRequest = {
      username: legajo,
      password: contrasena
    };

    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/login`,
      loginRequest
    ).pipe(
      tap(response => this.handleAuthentication(response))
    );
  }

  /**
   * Helper to handle successful login, saving tokens and updating state
   */
  private handleAuthentication(response: AuthResponse): void {
    localStorage.setItem('pps_token', response.token);
    localStorage.setItem('pps_user', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  /**
   * Logs out the user, clearing tokens and returning state to null.
   */
  public logout(): void {
    localStorage.removeItem('pps_token');
    localStorage.removeItem('pps_user');
    this.currentUserSubject.next(null);
  }

  /**
   * Returns current user synchronously.
   */
  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Checks if user is authenticated.
   */
  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Helpers to check roles and administration utilities
   */
  public isDirectivo(): boolean {
    const user = this.getCurrentUser();
    return user ? user.rol === 'ROLE_DIRECTIVO' : false;
  }

  public isJefe(): boolean {
    const user = this.getCurrentUser();
    return user ? user.rol === 'ROLE_JEFE_POLICIAL' : false;
  }

  public isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.rol === 'ROLE_ADMINISTRATIVO' : false;
  }

  public getOfficialRegistry() {
    return this.officialRegistry;
  }

  public getAllUsers(): User[] {
    const stored = localStorage.getItem('pps_user_accounts');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return this.defaultUsers;
      }
    }
    return this.defaultUsers;
  }

  public saveUsersList(users: User[]): void {
    localStorage.setItem('pps_user_accounts', JSON.stringify(users));
  }

  public addUser(user: User): void {
    const users = this.getAllUsers();
    users.push(user);
    this.saveUsersList(users);
  }

  public updateUser(updatedUser: User): void {
    let users = this.getAllUsers();
    users = users.map(u => u.legajo === updatedUser.legajo ? updatedUser : u);
    this.saveUsersList(users);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.legajo === updatedUser.legajo) {
      const { contrasena, ...sessionUser } = updatedUser;
      localStorage.setItem('pps_user', JSON.stringify(sessionUser));
      this.currentUserSubject.next(sessionUser as User);
    }
  }

  public deleteUser(legajo: string): void {
    let users = this.getAllUsers();
    users = users.filter(u => u.legajo !== legajo);
    this.saveUsersList(users);
  }
}
