import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { DataGeneratorService } from './data-generator.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { User, Transaction } from '../../shared/models/models';
import { faker } from '@faker-js/faker/locale/es_MX';

@Injectable({
  providedIn: 'root'
})
export class SimulatorService {
  isSimulating = false;
  progress = 0;

  constructor(
    private storage: StorageService,
    private dataGenerator: DataGeneratorService,
    private analytics: AnalyticsService
  ) {}

  async generateInitialState(userCount: number = 1000) {
    this.isSimulating = true;
    this.progress = 0;
    
    await this.storage.clearAll();
    
    const merchants = this.dataGenerator.getMerchants();
    await this.storage.merchants.bulkAdd(merchants);

    const users = this.dataGenerator.generateUsers(userCount);
    await this.storage.users.bulkAdd(users);
    
    const allAccounts = [];
    for (let i = 0; i < users.length; i++) {
      const accounts = this.dataGenerator.generateAccountsForUser(users[i].id);
      allAccounts.push(...accounts);
      if (i % 100 === 0) {
        this.progress = Math.round((i / users.length) * 100);
      }
    }
    await this.storage.accounts.bulkAdd(allAccounts);

    this.isSimulating = false;
    this.progress = 100;
  }

  async runSimulation(days: number) {
    this.isSimulating = true;
    this.progress = 0;
    
    const users = await this.storage.users.toArray();
    if (users.length === 0) {
      alert('Por favor genera usuarios primero.');
      this.isSimulating = false;
      return;
    }

    const merchants = await this.storage.merchants.toArray();
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    const startDate = now - (days * msPerDay);

    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
      const currentDayDate = new Date(startDate + (dayOffset * msPerDay));
      const currentDayMs = currentDayDate.getTime();
      const isPayday = currentDayDate.getDate() === 15 || currentDayDate.getDate() === 30 || currentDayDate.getDate() === 31;

      // Filter active users for this simulated day
      const activeUsers = users.filter(u => {
        const rand = faker.number.int({ min: 1, max: 100 });
        if (u.persona === 'Empleado' && isPayday) return rand <= 80;
        if (u.persona === 'Estudiante') return rand <= 40;
        if (u.persona === 'Empresario') return rand <= 60;
        return rand <= 15;
      });

      const transactionsBatch: Transaction[] = [];

      for (const user of activeUsers) {
        // Pseudo-consistent assignment for feature flags based on user ID
        const flag_smart_insights = this.hashString(user.id) % 100 < 30 ? 'on' : 'off';
        const flag_quick_transfer = this.hashString(user.id) % 100 < 50 ? 'on' : 'off';
        const exp_dashboard = this.hashString(user.id) % 100 < 20 ? 'variant_b' : 'control';

        this.analytics.identify(user.id, {
          city: user.city,
          province: user.province,
          persona: user.persona,
          bank: user.bank,
          premiumStatus: user.premiumStatus,
          flag_smart_insights,
          flag_quick_transfer,
          exp_dashboard
        });

        const sessionId = currentDayMs + this.hashString(user.id); // unique session id per user per day
        let timeCursor = currentDayMs + faker.number.int({ min: 1000, max: 8 * 60 * 60 * 1000 }); // Sometime during that day
        
        // Base Events
        this.analytics.track('app_opened', { session_id: sessionId }, timeCursor);
        timeCursor += 2000;
        this.analytics.track('login_completed', { session_id: sessionId, method: 'face_id' }, timeCursor);
        timeCursor += 2000;
        this.analytics.track('dashboard_viewed', { session_id: sessionId, variant: exp_dashboard }, timeCursor);
        timeCursor += 3000;

        // Exploratory Journey Noise
        if (faker.number.int({ min: 1, max: 100 }) <= 40) {
          const explorationSteps = faker.number.int({ min: 1, max: 3 });
          const possibleViews = ['accounts_viewed', 'activity_viewed', 'profile_viewed', 'notifications_viewed'];
          for (let i = 0; i < explorationSteps; i++) {
            const view = faker.helpers.arrayElement(possibleViews);
            this.analytics.track(view, { session_id: sessionId }, timeCursor);
            timeCursor += faker.number.int({ min: 3000, max: 10000 });
            
            // User frequently bounces back to dashboard
            if (faker.number.int({ min: 1, max: 100 }) <= 50) {
               this.analytics.track('dashboard_viewed', { session_id: sessionId }, timeCursor);
               timeCursor += faker.number.int({ min: 2000, max: 5000 });
            }
          }
        }

        // Fetch user's main account to attach transactions
        const accounts = await this.storage.accounts.where('userId').equals(user.id).toArray();
        const primaryAcc = accounts.find(a => a.type === 'Cuenta de ahorro') || accounts[0];
        if (!primaryAcc) continue;

        // Persona specific flows
        if (user.persona === 'Empleado' && isPayday) {
          transactionsBatch.push(this.createTransaction(primaryAcc.id, user.id, user.monthlyIncome, currentDayMs, 'Depósito de Nómina', 'CREDIT', 'Ingresos'));
          
          this.analytics.track('bill_payment_started', { session_id: sessionId, bill_type: 'Electricity' }, timeCursor);
          timeCursor += 5000;
          
          // Journey divergence: Some check accounts before paying to verify funds
          if (faker.number.int({ min: 1, max: 100 }) <= 20) {
             this.analytics.track('accounts_viewed', { session_id: sessionId }, timeCursor);
             timeCursor += 4000;
             this.analytics.track('bill_payment_resumed', { session_id: sessionId }, timeCursor);
             timeCursor += 3000;
          }

          this.analytics.track('bill_payment_completed', { session_id: sessionId, bill_type: 'Electricity', amount: 1500 }, timeCursor);
          transactionsBatch.push(this.createTransaction(primaryAcc.id, user.id, 1500, timeCursor, 'Pago Edesur', 'DEBIT', 'Servicios'));
          timeCursor += 2000;
        }

        if (user.persona === 'Estudiante') {
          this.analytics.track('transfer_started', { session_id: sessionId, transfer_type: 'peer_to_peer' }, timeCursor);
          timeCursor += 3000;
          this.analytics.track('transfer_recipient_selected', { session_id: sessionId }, timeCursor);
          timeCursor += 4000;
          
          // Journey error: Invalid amount entered first
          if (faker.number.int({ min: 1, max: 100 }) <= 15) {
             this.analytics.track('transfer_error', { session_id: sessionId, error_type: 'insufficient_funds' }, timeCursor);
             timeCursor += 5000;
          }

          this.analytics.track('transfer_amount_entered', { session_id: sessionId, amount: 300 }, timeCursor);
          timeCursor += 8000;
          
          if (faker.number.int({ min: 1, max: 100 }) > 10) {
            this.analytics.track('transfer_completed', { session_id: sessionId, amount: 300, destinationBank: 'Popular' }, timeCursor);
            transactionsBatch.push(this.createTransaction(primaryAcc.id, user.id, 300, timeCursor, 'Transferencia a amigo', 'DEBIT', 'General'));
            timeCursor += 2000;
          } else {
            // Abandonment journey
            this.analytics.track('dashboard_viewed', { session_id: sessionId }, timeCursor);
            timeCursor += 2000;
          }
        }

        if (user.persona === 'Padre/Madre') {
          const merchant = merchants.find(m => m.category === 'Supermercado');
          const spend = faker.number.int({ min: 3000, max: 12000 });
          transactionsBatch.push(this.createTransaction(primaryAcc.id, user.id, spend, timeCursor, `Compra en ${merchant?.name || 'Supermercado'}`, 'DEBIT', 'Supermercado', merchant?.name));
        }

        if (user.persona === 'Empresario') {
          this.analytics.track('accounts_viewed', { session_id: sessionId }, timeCursor);
          timeCursor += 4000;
          this.analytics.track('activity_viewed', { session_id: sessionId }, timeCursor);
          timeCursor += 8000;
          
          this.analytics.track('transfer_started', { session_id: sessionId, transfer_type: 'b2b' }, timeCursor);
          timeCursor += 5000;
          const tAmt = faker.number.int({ min: 20000, max: 150000 });
          this.analytics.track('transfer_completed', { session_id: sessionId, amount: tAmt, destinationBank: 'BHD' }, timeCursor);
          transactionsBatch.push(this.createTransaction(primaryAcc.id, user.id, tAmt, timeCursor, 'Pago a Proveedor', 'DEBIT', 'Negocios'));
          timeCursor += 2000;
        }

        // --- Generalized Random Actions (For All Personas) ---
        const randomRoll = faker.number.int({ min: 1, max: 100 });
        
        // 5% chance to add beneficiary
        if (randomRoll <= 5) {
          this.analytics.track('beneficiary_creation_started', { session_id: sessionId }, timeCursor);
          timeCursor += 15000;
          this.analytics.track('beneficiary_saved', { session_id: sessionId, bank: 'Banreservas' }, timeCursor);
          timeCursor += 2000;
        }

        // 8% chance to withdraw money via ATM code (Retiro Móvil)
        if (randomRoll > 5 && randomRoll <= 13) {
          const wAmt = faker.helpers.arrayElement([1000, 2000, 4000, 10000]);
          this.analytics.track('withdrawal_code_generated', { session_id: sessionId, amount: wAmt }, timeCursor);
          timeCursor += 45000;
          
          // High conversion for code generation to actual withdrawal, say 90%
          if (faker.number.int({ min: 1, max: 100 }) <= 90) {
             this.analytics.track('withdrawal_completed', { session_id: sessionId, amount: wAmt }, timeCursor);
             transactionsBatch.push(this.createTransaction(primaryAcc.id, user.id, wAmt, timeCursor, 'Retiro sin Tarjeta', 'DEBIT', 'Efectivo'));
             timeCursor += 2000;
          }
        }

        // 3% chance to create a savings goal
        if (randomRoll > 13 && randomRoll <= 16) {
          this.analytics.track('savings_goal_created', { session_id: sessionId, goal_type: 'Vacations', target_amount: 50000 }, timeCursor);
          timeCursor += 2000;
        }

        // 10% chance to pay a loan or credit card
        if (randomRoll > 16 && randomRoll <= 26) {
          this.analytics.track('loan_payment_started', { session_id: sessionId }, timeCursor);
          timeCursor += 8000;
          this.analytics.track('loan_payment_completed', { session_id: sessionId, amount: 5000 }, timeCursor);
          transactionsBatch.push(this.createTransaction(primaryAcc.id, user.id, 5000, timeCursor, 'Pago de Préstamo', 'DEBIT', 'Préstamos'));
          timeCursor += 2000;
        }
        
        // Explicitly close the journey
        this.analytics.track('app_closed', { session_id: sessionId }, timeCursor);
      }

      if (transactionsBatch.length > 0) {
        await this.storage.transactions.bulkAdd(transactionsBatch);
      }

      this.progress = Math.round((dayOffset / days) * 100);
      
      if (dayOffset % 5 === 0) {
        this.analytics.flush();
      }
    }

    this.analytics.flush();
    this.isSimulating = false;
    this.progress = 100;
  }

  private createTransaction(accountId: string, userId: string, amount: number, date: number, concept: string, type: 'CREDIT'|'DEBIT', category: string, merchant?: string): Transaction {
    return {
      id: faker.string.uuid(),
      accountId,
      userId,
      amount,
      date,
      concept,
      type,
      category,
      merchant
    };
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }
}