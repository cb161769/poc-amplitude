import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { personCircleOutline, arrowForwardOutline, checkmarkCircle } from 'ionicons/icons';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { faker } from '@faker-js/faker/locale/es_MX';

@Component({
  selector: 'app-transfers',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="dark">
        <ion-buttons slot="start" *ngIf="step > 1 && step < 4">
          <ion-back-button (click)="step = step - 1" defaultHref=""></ion-back-button>
        </ion-buttons>
        <ion-title>Transferencias</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="bg-gray-900 text-white">
      
      <!-- Step 1: Select Recipient -->
      <div *ngIf="step === 1" class="p-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <h2 class="text-xl font-bold mb-4">¿A quién deseas transferir?</h2>
        
        <div class="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <ion-input label="Cuenta o Teléfono" labelPlacement="stacked" placeholder="Ej. 123456789" [(ngModel)]="recipientAccount" class="text-white font-mono"></ion-input>
        </div>
        
        <h3 class="text-gray-400 text-sm font-semibold mt-6 mb-2 px-1 tracking-wider uppercase">Contactos Recientes</h3>
        <div class="space-y-3">
          <div *ngFor="let contact of recentContacts" class="flex items-center justify-between bg-gray-800 p-4 rounded-2xl active:bg-gray-700 border border-gray-700 transition-colors shadow-md" (click)="selectContact(contact)">
            <div class="flex items-center gap-3">
              <ion-icon name="person-circle-outline" class="text-gray-400 text-4xl"></ion-icon>
              <div>
                <p class="font-semibold text-white">{{ contact.name }}</p>
                <p class="text-xs text-gray-400">{{ contact.bank }} - {{ contact.account }}</p>
              </div>
            </div>
            <ion-icon name="arrow-forward-outline" class="text-gray-500"></ion-icon>
          </div>
        </div>

        <ion-button expand="block" color="primary" class="mt-8 h-12 font-semibold shadow-lg shadow-blue-500/30 rounded-xl" (click)="nextStep(2)" [disabled]="!recipientAccount">
          Continuar
        </ion-button>
      </div>

      <!-- Step 2: Amount & Concept -->
      <div *ngIf="step === 2" class="p-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div class="text-center mt-4">
          <p class="text-gray-400 text-sm mb-1">Transferir a</p>
          <p class="text-2xl font-bold text-white">{{ selectedContact?.name || recipientAccount }}</p>
          <p class="text-sm text-green-400 mt-1 font-medium">{{ selectedContact?.bank || 'Banco Nova' }}</p>
        </div>

        <div class="bg-gray-800 rounded-3xl p-6 text-center border border-gray-700 shadow-xl mt-8">
          <p class="text-gray-400 text-sm mb-2">Monto a enviar (RD$)</p>
          <ion-input type="number" [(ngModel)]="amount" class="text-5xl font-bold text-center bg-transparent text-white" placeholder="0.00"></ion-input>
        </div>

        <div class="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <ion-input label="Concepto (opcional)" labelPlacement="stacked" placeholder="Ej. Pago de cena" [(ngModel)]="concept" class="text-white"></ion-input>
        </div>

        <ion-button expand="block" color="primary" class="mt-8 h-12 font-semibold shadow-lg shadow-blue-500/30 rounded-xl" (click)="nextStep(3)" [disabled]="!amount || amount <= 0">
          Revisar Transferencia
        </ion-button>
      </div>

      <!-- Step 3: Confirmation -->
      <div *ngIf="step === 3" class="p-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <h2 class="text-2xl font-bold text-center mb-6 mt-4">Confirmación</h2>
        
        <div class="bg-gray-800 rounded-3xl p-6 space-y-4 border border-gray-700 shadow-xl">
          <div class="flex justify-between border-b border-gray-700 pb-4">
            <span class="text-gray-400">Monto</span>
            <span class="font-bold text-2xl text-white tracking-tight">RD$ {{ amount | number:'1.2-2' }}</span>
          </div>
          <div class="flex justify-between border-b border-gray-700 pb-4 pt-2">
            <span class="text-gray-400">Destinatario</span>
            <span class="font-medium text-right text-white">{{ selectedContact?.name || recipientAccount }}<br><small class="text-green-400">{{ selectedContact?.bank || 'Banco Nova' }}</small></span>
          </div>
          <div class="flex justify-between pt-2">
            <span class="text-gray-400">Concepto</span>
            <span class="font-medium text-right text-white">{{ concept || 'Sin concepto' }}</span>
          </div>
        </div>

        <ion-button expand="block" color="success" class="mt-8 h-14 font-bold text-lg shadow-lg shadow-green-500/30 rounded-xl" (click)="confirmTransfer()">
          Confirmar y Enviar
        </ion-button>
      </div>

      <!-- Step 4: Success -->
      <div *ngIf="step === 4" class="p-6 flex flex-col items-center justify-center h-[80vh] space-y-6 text-center animate-in zoom-in duration-500">
        <ion-icon name="checkmark-circle" class="text-green-500 text-9xl drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]"></ion-icon>
        <h2 class="text-3xl font-bold text-white">¡Transferencia Exitosa!</h2>
        <p class="text-gray-400 text-lg">Has enviado <strong class="text-white">RD$ {{ amount | number:'1.2-2' }}</strong> a {{ selectedContact?.name || recipientAccount }}.</p>
        
        <div class="w-full mt-12 space-y-4">
          <ion-button expand="block" fill="outline" color="light" class="w-full h-12 rounded-xl" (click)="reset()">
            Hacer otra transferencia
          </ion-button>
          <ion-button expand="block" fill="clear" color="primary" class="w-full h-12" routerLink="/tabs/dashboard">
            Volver al Inicio
          </ion-button>
        </div>
      </div>

    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class TransfersComponent {
  analytics = inject(AnalyticsService);
  
  step = 1;
  recipientAccount = '';
  selectedContact: any = null;
  amount: number | null = null;
  concept = '';

  recentContacts = [
    { name: faker.person.fullName(), bank: 'Banreservas', account: faker.finance.accountNumber(10) },
    { name: faker.person.fullName(), bank: 'Banco Popular', account: faker.finance.accountNumber(10) },
    { name: faker.person.fullName(), bank: 'BHD', account: faker.finance.accountNumber(10) }
  ];

  constructor() {
    addIcons({ personCircleOutline, arrowForwardOutline, checkmarkCircle });
  }

  selectContact(contact: any) {
    this.selectedContact = contact;
    this.recipientAccount = contact.account;
    this.nextStep(2);
  }

  nextStep(s: number) {
    this.step = s;
    if (s === 1) this.analytics.track('transfer_flow_started');
    if (s === 2) this.analytics.track('transfer_recipient_selected');
    if (s === 3) this.analytics.track('transfer_amount_entered', { amount: this.amount });
  }

  confirmTransfer() {
    this.analytics.track('transfer_completed', {
      amount: this.amount,
      destinationBank: this.selectedContact?.bank || 'Banco Nova',
      hasConcept: !!this.concept
    });
    this.step = 4;
  }

  reset() {
    this.step = 1;
    this.recipientAccount = '';
    this.selectedContact = null;
    this.amount = null;
    this.concept = '';
  }
}
