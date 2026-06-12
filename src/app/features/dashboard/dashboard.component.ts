import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { send, receipt, phonePortrait, qrCode, list, notificationsOutline, cardOutline, walletOutline } from 'ionicons/icons';
import { StorageService } from '../../core/storage/storage.service';
import { AuthService } from '../../core/auth/auth.service';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { User, Account } from '../../shared/models/models';

@Component({
  selector: 'app-dashboard',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="dark">
        <ion-buttons slot="start">
          <ion-button>
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center text-gray-900 font-bold">
              {{ user?.firstName?.charAt(0) || 'U' }}
            </div>
          </ion-button>
        </ion-buttons>
        <ion-title>Hola, {{ user?.firstName || 'Usuario' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon name="notifications-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="bg-gray-900">
      <div class="p-4 space-y-6">
        <!-- Balance Card -->
        <div class="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl p-6 shadow-xl shadow-black/40 text-white relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-40 h-40 bg-green-500/10 rounded-full blur-2xl"></div>
          <div class="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
          
          <p class="text-gray-400 text-sm font-medium mb-1 relative z-10">Balance Total</p>
          <h2 class="text-4xl font-bold tracking-tight relative z-10">RD$ {{ totalBalance | number:'1.2-2' }}</h2>
          
          <div class="mt-8 flex justify-between items-end relative z-10 border-t border-gray-700/50 pt-4">
            <div>
              <p class="text-gray-400 text-xs mb-1">Cuentas</p>
              <p class="font-semibold text-lg text-green-400">RD$ {{ savingsBalance | number:'1.2-2' }}</p>
            </div>
            <div class="text-right">
              <p class="text-gray-400 text-xs mb-1">Tarjetas (Consumo)</p>
              <p class="font-semibold text-lg text-red-400">RD$ {{ creditBalance | number:'1.2-2' }}</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div>
          <h3 class="text-gray-400 text-sm font-semibold mb-3 px-1 tracking-wider">ACCIONES RÁPIDAS</h3>
          <div class="flex justify-between px-2">
            <div class="flex flex-col items-center" (click)="trackAction('transfer')">
              <div class="w-16 h-16 bg-gray-800 border border-gray-700 rounded-2xl flex items-center justify-center mb-2 active:scale-95 transition-transform shadow-lg">
                <ion-icon name="send" class="text-green-400 text-2xl"></ion-icon>
              </div>
              <span class="text-xs text-gray-300 font-medium">Transferir</span>
            </div>
            <div class="flex flex-col items-center" (click)="trackAction('pay_bill')">
              <div class="w-16 h-16 bg-gray-800 border border-gray-700 rounded-2xl flex items-center justify-center mb-2 active:scale-95 transition-transform shadow-lg">
                <ion-icon name="receipt" class="text-blue-400 text-2xl"></ion-icon>
              </div>
              <span class="text-xs text-gray-300 font-medium">Pagar</span>
            </div>
            <div class="flex flex-col items-center" (click)="trackAction('recharge')">
              <div class="w-16 h-16 bg-gray-800 border border-gray-700 rounded-2xl flex items-center justify-center mb-2 active:scale-95 transition-transform shadow-lg">
                <ion-icon name="phone-portrait" class="text-purple-400 text-2xl"></ion-icon>
              </div>
              <span class="text-xs text-gray-300 font-medium">Recargar</span>
            </div>
            <div class="flex flex-col items-center" (click)="trackAction('qr')">
              <div class="w-16 h-16 bg-gray-800 border border-gray-700 rounded-2xl flex items-center justify-center mb-2 active:scale-95 transition-transform shadow-lg">
                <ion-icon name="qr-code" class="text-yellow-400 text-2xl"></ion-icon>
              </div>
              <span class="text-xs text-gray-300 font-medium">Código QR</span>
            </div>
          </div>
        </div>

        <!-- Accounts List -->
        <div>
          <div class="flex justify-between items-center mb-3 px-1">
            <h3 class="text-gray-400 text-sm font-semibold tracking-wider">MIS PRODUCTOS</h3>
            <span class="text-green-400 text-xs font-semibold uppercase tracking-wide">Ver todos</span>
          </div>
          <div class="space-y-3">
            <div *ngFor="let acc of accounts" class="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex justify-between items-center active:bg-gray-700 transition-colors" (click)="trackAction('view_account')">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center">
                  <ion-icon [name]="acc.type === 'Tarjeta de crédito' ? 'card-outline' : 'wallet-outline'" class="text-gray-300 text-xl"></ion-icon>
                </div>
                <div>
                  <p class="font-semibold text-white">{{ acc.type }}</p>
                  <p class="text-xs text-gray-400 tracking-widest">**** {{ acc.number | slice:-4 }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold text-white text-lg">RD$ {{ acc.balance | number:'1.2-2' }}</p>
                <p class="text-[10px] text-gray-500 uppercase">{{ acc.type === 'Tarjeta de crédito' ? 'Consumo' : 'Disponible' }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  storage = inject(StorageService);
  analytics = inject(AnalyticsService);

  user: User | null = null;
  accounts: Account[] = [];
  
  totalBalance = 0;
  savingsBalance = 0;
  creditBalance = 0;

  constructor() {
    addIcons({ send, receipt, phonePortrait, qrCode, list, notificationsOutline, cardOutline, walletOutline });
  }

  async ngOnInit() {
    this.user = this.auth.getCurrentUser();
    if (this.user) {
      this.accounts = await this.storage.accounts.where('userId').equals(this.user.id).toArray();
      this.calculateBalances();
      this.analytics.track('dashboard_viewed', { accountCount: this.accounts.length });
    }
  }

  calculateBalances() {
    this.totalBalance = 0;
    this.savingsBalance = 0;
    this.creditBalance = 0;

    this.accounts.forEach(acc => {
      if (acc.type === 'Cuenta de ahorro' || acc.type === 'Cuenta corriente') {
        this.savingsBalance += acc.balance;
        this.totalBalance += acc.balance;
      } else if (acc.type === 'Tarjeta de crédito') {
        this.creditBalance += acc.balance;
      }
    });
  }

  trackAction(actionName: string) {
    this.analytics.track('quick_action_clicked', { action: actionName });
  }
}
