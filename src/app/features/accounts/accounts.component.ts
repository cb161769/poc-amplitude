import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { cardOutline, walletOutline, chevronForwardOutline } from 'ionicons/icons';
import { StorageService } from '../../core/storage/storage.service';
import { AuthService } from '../../core/auth/auth.service';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { User, Account } from '../../shared/models/models';

@Component({
  selector: 'app-accounts',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="dark">
        <ion-title>Productos</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="bg-gray-900">
      <div class="p-4 space-y-4">
        
        <h2 class="text-xl font-bold text-white mb-2 px-1">Cuentas Bancarias</h2>
        <div class="space-y-3">
          <div *ngFor="let acc of savingsAccounts" class="bg-gray-800 border border-gray-700 rounded-2xl p-4 active:bg-gray-700 transition-colors shadow-lg" (click)="viewDetails(acc)">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <ion-icon name="wallet-outline" class="text-green-400 text-lg"></ion-icon>
                </div>
                <div>
                  <p class="font-semibold text-white">{{ acc.type }}</p>
                  <p class="text-xs text-gray-400 font-mono">{{ acc.number }}</p>
                </div>
              </div>
              <ion-icon name="chevron-forward-outline" class="text-gray-500"></ion-icon>
            </div>
            <div class="border-t border-gray-700 pt-3">
              <p class="text-sm text-gray-400 mb-1">Balance Disponible</p>
              <p class="text-2xl font-bold text-white tracking-tight">RD$ {{ acc.balance | number:'1.2-2' }}</p>
            </div>
          </div>
        </div>

        <h2 class="text-xl font-bold text-white mb-2 mt-6 px-1" *ngIf="creditAccounts.length > 0">Tarjetas de Crédito</h2>
        <div class="space-y-3">
          <div *ngFor="let acc of creditAccounts" class="bg-gradient-to-tr from-gray-800 to-gray-700 border border-gray-600 rounded-2xl p-4 active:scale-[0.98] transition-transform shadow-lg relative overflow-hidden" (click)="viewDetails(acc)">
            <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
            <div class="flex justify-between items-start mb-6 relative z-10">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <ion-icon name="card-outline" class="text-blue-400 text-lg"></ion-icon>
                </div>
                <div>
                  <p class="font-semibold text-white">{{ acc.type }}</p>
                  <p class="text-xs text-gray-300 font-mono tracking-widest">**** **** **** {{ acc.number | slice:-4 }}</p>
                </div>
              </div>
              <div class="w-10 h-6 bg-white/10 rounded flex items-center justify-center">
                <span class="text-[10px] font-bold text-white italic">VISA</span>
              </div>
            </div>
            <div class="flex justify-between items-end border-t border-gray-600 pt-3 relative z-10">
              <div>
                <p class="text-xs text-gray-300 mb-1">Balance Consumido</p>
                <p class="text-xl font-bold text-white tracking-tight">RD$ {{ acc.balance | number:'1.2-2' }}</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-gray-400 mb-1 uppercase">Límite</p>
                <p class="text-sm font-semibold text-gray-300">RD$ 100,000.00</p>
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
export class AccountsComponent implements OnInit {
  auth = inject(AuthService);
  storage = inject(StorageService);
  analytics = inject(AnalyticsService);

  savingsAccounts: Account[] = [];
  creditAccounts: Account[] = [];

  constructor() {
    addIcons({ cardOutline, walletOutline, chevronForwardOutline });
  }

  async ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (user) {
      const allAccounts = await this.storage.accounts.where('userId').equals(user.id).toArray();
      this.savingsAccounts = allAccounts.filter(a => a.type === 'Cuenta de ahorro' || a.type === 'Cuenta corriente');
      this.creditAccounts = allAccounts.filter(a => a.type === 'Tarjeta de crédito');
      this.analytics.track('accounts_viewed', { totalAccounts: allAccounts.length });
    }
  }

  viewDetails(acc: Account) {
    this.analytics.track('account_selected', { accountType: acc.type });
  }
}
