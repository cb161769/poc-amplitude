import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SimulatorService } from '../../core/simulator/simulator.service';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { StorageService } from '../../core/storage/storage.service';
import { addIcons } from 'ionicons';
import { checkmarkCircle, chevronForwardOutline, keyOutline, peopleOutline, flashOutline, logInOutline } from 'ionicons/icons';

@Component({
  selector: 'app-developer',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="dark">
        <ion-title class="text-green-400 font-bold">🛠 Developer Console</ion-title>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/login"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bg-gray-900 text-white">
      <div class="max-w-lg mx-auto p-4 space-y-4 pb-10">

        <!-- Header -->
        <div class="pt-2 pb-2">
          <h1 class="text-2xl font-bold text-white">Setup Wizard</h1>
          <p class="text-gray-400 text-sm mt-1">Complete each step in order to start the demo.</p>
        </div>

        <!-- STEP 1: SDK Init -->
        <div class="rounded-2xl border p-5 space-y-4 transition-all"
             [ngClass]="sdkInitialized() ? 'border-green-500/40 bg-green-950/30' : 'border-gray-600 bg-gray-800'">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                 [ngClass]="sdkInitialized() ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'">
              <ion-icon *ngIf="sdkInitialized()" name="checkmark-circle" class="text-lg"></ion-icon>
              <span *ngIf="!sdkInitialized()">1</span>
            </div>
            <div>
              <h2 class="font-semibold text-white">Initialize Amplitude SDK</h2>
              <p class="text-xs text-gray-400">Enter your Amplitude API Key to enable event tracking.</p>
            </div>
          </div>

          <div *ngIf="!sdkInitialized()" class="space-y-3">
            <div class="bg-gray-900 rounded-xl px-4 py-1 border border-gray-700">
              <ion-input
                type="text"
                [(ngModel)]="apiKey"
                placeholder="Paste your Amplitude API Key here..."
                labelPlacement="stacked"
                label="API Key"
                class="text-white text-sm">
              </ion-input>
            </div>
            <ion-button expand="block" color="primary" class="font-semibold" (click)="initAmplitude()" [disabled]="!apiKey">
              <ion-icon name="key-outline" slot="start"></ion-icon>
              Connect Amplitude
            </ion-button>
          </div>

          <div *ngIf="sdkInitialized()" class="flex items-center gap-2 text-green-400 text-sm font-medium">
            <ion-icon name="checkmark-circle" class="text-lg"></ion-icon>
            SDK connected and ready to track events
          </div>
        </div>

        <!-- STEP 2: Generate Users -->
        <div class="rounded-2xl border p-5 space-y-4 transition-all"
             [ngClass]="!sdkInitialized() ? 'border-gray-700 bg-gray-800/40 opacity-50 pointer-events-none' :
                        usersGenerated() ? 'border-green-500/40 bg-green-950/30' : 'border-blue-500/40 bg-gray-800'">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                 [ngClass]="usersGenerated() ? 'bg-green-500 text-white' : 'bg-blue-500/30 text-blue-300'">
              <ion-icon *ngIf="usersGenerated()" name="checkmark-circle" class="text-lg"></ion-icon>
              <span *ngIf="!usersGenerated()">2</span>
            </div>
            <div>
              <h2 class="font-semibold text-white">Generate User Database</h2>
              <p class="text-xs text-gray-400">Creates synthetic Dominican users, accounts & merchants.</p>
            </div>
          </div>

          <div *ngIf="!usersGenerated()" class="space-y-3">
            <div class="grid grid-cols-4 gap-2">
              <button *ngFor="let n of [50, 250, 500, 1000]"
                class="rounded-xl py-3 border text-sm font-semibold transition-all"
                [ngClass]="userCount === n ? 'bg-blue-500 border-blue-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300'"
                (click)="userCount = n">
                {{ n }}
              </button>
            </div>
            <p class="text-xs text-gray-500 text-center">Select number of synthetic users</p>
            <ion-button expand="block" color="secondary" class="font-semibold"
              (click)="generateUsers()" [disabled]="simService.isSimulating">
              <ion-icon name="people-outline" slot="start"></ion-icon>
              Generate {{ userCount }} Users
            </ion-button>
          </div>

          <div *ngIf="simService.isSimulating && simulationStep === 'users'" class="space-y-2">
            <ion-progress-bar [value]="simService.progress / 100" color="secondary"></ion-progress-bar>
            <p class="text-center text-xs text-gray-400">Creating users... {{ simService.progress }}%</p>
          </div>

          <div *ngIf="usersGenerated()" class="flex items-center gap-2 text-green-400 text-sm font-medium">
            <ion-icon name="checkmark-circle" class="text-lg"></ion-icon>
            {{ userCount }} users generated in IndexedDB
          </div>
        </div>

        <!-- STEP 3: Run Historical Simulation -->
        <div class="rounded-2xl border p-5 space-y-4 transition-all"
             [ngClass]="!usersGenerated() ? 'border-gray-700 bg-gray-800/40 opacity-50 pointer-events-none' :
                        simulationDone() ? 'border-green-500/40 bg-green-950/30' : 'border-purple-500/40 bg-gray-800'">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                 [ngClass]="simulationDone() ? 'bg-green-500 text-white' : 'bg-purple-500/30 text-purple-300'">
              <ion-icon *ngIf="simulationDone()" name="checkmark-circle" class="text-lg"></ion-icon>
              <span *ngIf="!simulationDone()">3</span>
            </div>
            <div>
              <h2 class="font-semibold text-white">Run Historical Simulation</h2>
              <p class="text-xs text-gray-400">Generates backdated Amplitude events with real journeys & funnels.</p>
            </div>
          </div>

          <div *ngIf="!simulationDone()" class="space-y-3">
            <div class="grid grid-cols-4 gap-2">
              <button *ngFor="let d of [7, 14, 30, 90]"
                class="rounded-xl py-3 border text-sm font-semibold transition-all"
                [ngClass]="simDays === d ? 'bg-purple-500 border-purple-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300'"
                (click)="simDays = d">
                {{ d }}d
              </button>
            </div>
            <p class="text-xs text-gray-500 text-center">Days of historical data to generate</p>
            <ion-button expand="block" color="tertiary" class="font-semibold"
              (click)="runSimulation()" [disabled]="simService.isSimulating">
              <ion-icon name="flash-outline" slot="start"></ion-icon>
              Simulate {{ simDays }} Days of Activity
            </ion-button>
          </div>

          <div *ngIf="simService.isSimulating && simulationStep === 'events'" class="space-y-2">
            <ion-progress-bar [value]="simService.progress / 100" color="tertiary"></ion-progress-bar>
            <p class="text-center text-xs text-gray-400">
              Firing events to Amplitude... {{ simService.progress }}%<br>
              <span class="text-gray-500">This may take a few minutes for large datasets</span>
            </p>
          </div>

          <div *ngIf="simulationDone()" class="flex items-center gap-2 text-green-400 text-sm font-medium">
            <ion-icon name="checkmark-circle" class="text-lg"></ion-icon>
            {{ simDays }} days of events sent to Amplitude 🎉
          </div>
        </div>

        <!-- STEP 4: Go to App -->
        <div class="rounded-2xl border p-5 transition-all"
             [ngClass]="!usersGenerated() ? 'border-gray-700 bg-gray-800/40 opacity-50 pointer-events-none' : 'border-gray-600 bg-gray-800'">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold text-sm shrink-0 text-gray-300">4</div>
            <div>
              <h2 class="font-semibold text-white">Open the App</h2>
              <p class="text-xs text-gray-400">Log in as a simulated user to explore the banking demo.</p>
            </div>
          </div>
          <ion-button expand="block" color="success" class="font-bold" (click)="goToApp()">
            <ion-icon name="log-in-outline" slot="start"></ion-icon>
            Login as Demo User
          </ion-button>
        </div>

      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DeveloperComponent implements OnInit {
  simService = inject(SimulatorService);
  analyticsService = inject(AnalyticsService);
  storage = inject(StorageService);
  router = inject(Router);

  apiKey = '';
  userCount = 250;
  simDays = 30;
  simulationStep: 'users' | 'events' | null = null;

  sdkInitialized = signal(false);
  usersGenerated = signal(false);
  simulationDone = signal(false);

  constructor() {
    addIcons({ checkmarkCircle, chevronForwardOutline, keyOutline, peopleOutline, flashOutline, logInOutline });
  }

  async ngOnInit() {
    // Restore persisted API key
    const savedKey = localStorage.getItem('amplitude_api_key');
    if (savedKey) {
      this.apiKey = savedKey;
      this.analyticsService.initialize(savedKey);
      this.sdkInitialized.set(true);
    }

    // Check if users already exist in DB
    const count = await this.storage.users.count();
    if (count > 0) {
      this.usersGenerated.set(true);
      this.userCount = count;
    }
  }

  initAmplitude() {
    if (!this.apiKey.trim()) return;
    this.analyticsService.initialize(this.apiKey.trim());
    localStorage.setItem('amplitude_api_key', this.apiKey.trim());
    this.sdkInitialized.set(true);
  }

  async generateUsers() {
    this.simulationStep = 'users';
    await this.simService.generateInitialState(this.userCount);
    this.usersGenerated.set(true);
    this.simulationDone.set(false); // reset sim if users are re-generated
    this.simulationStep = null;
  }

  async runSimulation() {
    this.simulationStep = 'events';
    await this.simService.runSimulation(this.simDays);
    this.simulationDone.set(true);
    this.simulationStep = null;
  }

  goToApp() {
    this.router.navigate(['/login']);
  }
}

