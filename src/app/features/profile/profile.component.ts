import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { logOutOutline, settingsOutline, moonOutline, languageOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="dark">
        <ion-title>Mi Perfil</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="bg-gray-900 text-white">
      <div class="p-4 space-y-6">
        <div class="flex items-center gap-4 bg-gray-800 p-4 rounded-3xl border border-gray-700 shadow-lg">
          <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center text-2xl font-bold text-gray-900 shadow-inner">
            {{ user?.firstName?.charAt(0) || 'U' }}
          </div>
          <div>
            <h2 class="text-xl font-bold">{{ user?.firstName }} {{ user?.lastName }}</h2>
            <p class="text-gray-400 text-sm">{{ user?.persona }} • {{ user?.city }}</p>
          </div>
        </div>

        <h3 class="text-gray-400 text-sm font-semibold mb-2 px-1 tracking-wider uppercase">Ajustes</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-4 bg-gray-800 rounded-2xl border border-gray-700 active:bg-gray-700 transition-colors">
            <div class="flex items-center gap-3">
              <ion-icon name="settings-outline" class="text-xl text-blue-400"></ion-icon>
              <span class="font-medium">Configuración de Cuenta</span>
            </div>
          </div>
          <div class="flex items-center justify-between p-4 bg-gray-800 rounded-2xl border border-gray-700">
            <div class="flex items-center gap-3">
              <ion-icon name="moon-outline" class="text-xl text-purple-400"></ion-icon>
              <span class="font-medium">Modo Oscuro</span>
            </div>
            <ion-toggle checked="true" color="success"></ion-toggle>
          </div>
          <div class="flex items-center justify-between p-4 bg-gray-800 rounded-2xl border border-gray-700 active:bg-gray-700 transition-colors">
            <div class="flex items-center gap-3">
              <ion-icon name="language-outline" class="text-xl text-yellow-400"></ion-icon>
              <span class="font-medium">Idioma</span>
            </div>
            <span class="text-gray-400 text-sm">es-DO</span>
          </div>
        </div>

        <ion-button expand="block" color="danger" fill="outline" class="mt-12 h-12 rounded-xl border-red-500 text-red-500 font-bold" (click)="logout()">
          <ion-icon name="log-out-outline" slot="start"></ion-icon>
          Cerrar Sesión
        </ion-button>
      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ProfileComponent {
  auth = inject(AuthService);
  router = inject(Router);
  user = this.auth.getCurrentUser();

  constructor() {
    addIcons({ logOutOutline, settingsOutline, moonOutline, languageOutline });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
