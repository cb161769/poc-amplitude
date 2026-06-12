import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowUpOutline, arrowDownOutline, searchOutline, filterOutline } from 'ionicons/icons';
import { StorageService } from '../../core/storage/storage.service';
import { AuthService } from '../../core/auth/auth.service';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { Transaction } from '../../shared/models/models';

@Component({
  selector: 'app-activity',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="dark">
        <ion-title>Actividad</ion-title>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon name="search-outline"></ion-icon>
          </ion-button>
          <ion-button>
            <ion-icon name="filter-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="bg-gray-900">
      <div class="p-4">
        <h3 class="text-gray-400 text-sm font-semibold mb-4 px-1 tracking-wider uppercase">Recientes</h3>
        
        <div class="space-y-3">
          <div *ngIf="transactions.length === 0" class="text-center text-gray-500 py-10 bg-gray-800 rounded-2xl border border-gray-700">
            <p>No hay transacciones recientes.</p>
            <p class="text-xs mt-2">Usa el modo desarrollador para simular.</p>
          </div>
          
          <div *ngFor="let txn of transactions" class="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex justify-between items-center active:bg-gray-700 transition-colors shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full flex items-center justify-center" 
                   [ngClass]="txn.type === 'DEBIT' ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'">
                <ion-icon [name]="txn.type === 'DEBIT' ? 'arrow-up-outline' : 'arrow-down-outline'" 
                          [class]="txn.type === 'DEBIT' ? 'text-red-400' : 'text-green-400'"></ion-icon>
              </div>
              <div>
                <p class="font-semibold text-white">{{ txn.merchant || txn.concept || 'Transferencia' }}</p>
                <p class="text-xs text-gray-400">{{ txn.category || 'General' }} • {{ txn.date | date:'dd MMM yyyy' }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-bold text-lg" [ngClass]="txn.type === 'DEBIT' ? 'text-white' : 'text-green-400'">
                {{ txn.type === 'DEBIT' ? '-' : '+' }}RD$ {{ txn.amount | number:'1.2-2' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ActivityComponent implements OnInit {
  auth = inject(AuthService);
  storage = inject(StorageService);
  analytics = inject(AnalyticsService);

  transactions: Transaction[] = [];

  constructor() {
    addIcons({ arrowUpOutline, arrowDownOutline, searchOutline, filterOutline });
  }

  async ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.transactions = await this.storage.transactions
        .where('userId').equals(user.id)
        .limit(20)
        .toArray();
        
      this.analytics.track('activity_viewed', { transactionCount: this.transactions.length });
    }
  }
}
