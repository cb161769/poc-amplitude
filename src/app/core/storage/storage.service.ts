import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { User, Account, Transaction, Merchant, Goal } from '../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class StorageService extends Dexie {
  users!: Table<User, string>;
  accounts!: Table<Account, string>;
  transactions!: Table<Transaction, string>;
  merchants!: Table<Merchant, string>;
  goals!: Table<Goal, string>;

  constructor() {
    super('BancoNovaRDDB');
    this.version(1).stores({
      users: 'id, city, bank, persona',
      accounts: 'id, userId, type',
      transactions: 'id, accountId, userId, date, type, merchant, category',
      merchants: 'id, name, category',
      goals: 'id, userId'
    });
  }

  async clearAll() {
    await this.users.clear();
    await this.accounts.clear();
    await this.transactions.clear();
    await this.merchants.clear();
    await this.goals.clear();
  }
}
