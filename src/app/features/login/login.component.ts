import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../../core/storage/storage.service';
import { AuthService } from '../../core/auth/auth.service';
import { AnalyticsService } from '../../core/analytics/analytics.service';

@Component({
  selector: 'app-login',
  template: `
    <ion-content class="bg-gray-900 text-white">
      <div class="flex flex-col items-center justify-center h-full p-6 text-center space-y-8">
        <div>
          <div class="w-24 h-24 bg-gradient-to-tr from-green-400 to-blue-500 rounded-2xl mx-auto mb-4 shadow-lg shadow-green-500/30 flex items-center justify-center">
            <span class="text-4xl font-bold text-gray-900">N</span>
          </div>
          <h1 class="text-4xl font-bold tracking-tight">Banco Nova</h1>
          <p class="text-gray-400 mt-2">Tu dinero, siempre contigo.</p>
        </div>
        
        <div class="w-full max-w-sm space-y-4">
          <ion-button expand="block" color="primary" class="h-14 font-semibold text-lg shadow-lg" (click)="login()">
            Iniciar Sesión
          </ion-button>
          <ion-button expand="block" fill="clear" color="medium" (click)="openDeveloper()">
            Modo Desarrollador
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule]
})
export class LoginComponent {
  router = inject(Router);
  storage = inject(StorageService);
  auth = inject(AuthService);
  analytics = inject(AnalyticsService);

  async login() {
    this.analytics.track('login_started');
    const users = await this.storage.users.limit(1).toArray();
    if (users.length > 0) {
      this.auth.login(users[0]);
      this.analytics.identify(users[0].id, {
        city: users[0].city,
        persona: users[0].persona,
        bank: users[0].bank,
        premiumStatus: users[0].premiumStatus
      });
      this.analytics.track('login_completed');
      this.router.navigate(['/tabs/dashboard']);
    } else {
      alert('No users found in database. Please generate data in Developer Mode first.');
    }
  }

  openDeveloper() {
    this.router.navigate(['/developer']);
  }
}
