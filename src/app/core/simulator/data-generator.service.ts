import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker/locale/es_MX';
import { User, Account, Merchant } from '../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class DataGeneratorService {
  private dominicanCities = ['Santo Domingo', 'Santiago', 'La Vega', 'Puerto Plata', 'La Romana', 'San Cristóbal', 'Bonao', 'Moca', 'San Francisco de Macorís', 'Higüey'];
  private dominicanProvinces = ['Distrito Nacional', 'Santiago', 'La Vega', 'Puerto Plata', 'La Romana', 'San Cristóbal', 'Monseñor Nouel', 'Espaillat', 'Duarte', 'La Altagracia'];
  private banks = ['Banco Nova', 'Banco Popular', 'Banreservas', 'BHD', 'APAP'];
  private personas = ['Empleado', 'Freelancer', 'Estudiante', 'Padre/Madre', 'Empresario', 'Jubilado'];
  
  private merchantNames = [
    { name: 'Jumbo', category: 'Supermercado' },
    { name: 'Bravo', category: 'Supermercado' },
    { name: 'Sirena', category: 'Supermercado' },
    { name: 'Nacional', category: 'Supermercado' },
    { name: 'PriceSmart', category: 'Supermercado' },
    { name: 'Farmacia Carol', category: 'Farmacia' },
    { name: 'Farmacia GBC', category: 'Farmacia' },
    { name: 'Adrian Tropical', category: 'Restaurante' },
    { name: 'McDonald\'s', category: 'Comida Rápida' },
    { name: 'Burger King', category: 'Comida Rápida' },
    { name: 'KFC', category: 'Comida Rápida' },
    { name: 'Subway', category: 'Comida Rápida' },
    { name: 'Pizza Hut', category: 'Comida Rápida' },
    { name: 'Claro', category: 'Servicios' },
    { name: 'Altice', category: 'Servicios' },
    { name: 'Viva', category: 'Servicios' },
    { name: 'Shell', category: 'Combustible' },
    { name: 'Texaco', category: 'Combustible' },
    { name: 'Total', category: 'Combustible' },
    { name: 'Uber', category: 'Transporte' },
    { name: 'InDrive', category: 'Transporte' },
    { name: 'Caribe Tours', category: 'Transporte' },
    { name: 'Agora Mall', category: 'Entretenimiento' },
    { name: 'BlueMall', category: 'Entretenimiento' },
    { name: 'Netflix', category: 'Streaming' },
    { name: 'Spotify', category: 'Streaming' },
    { name: 'Amazon', category: 'Compras' },
    { name: 'Disney+', category: 'Streaming' }
  ];

  generateUsers(count: number): User[] {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      const cityIndex = faker.number.int({ min: 0, max: this.dominicanCities.length - 1 });
      const salary = faker.number.int({ min: 15000, max: 200000 });
      users.push({
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        city: this.dominicanCities[cityIndex],
        province: this.dominicanProvinces[cityIndex],
        age: faker.number.int({ min: 18, max: 80 }),
        occupation: faker.person.jobTitle(),
        salary: salary,
        monthlyIncome: salary * 0.9,
        monthlySpending: salary * faker.number.float({ min: 0.3, max: 0.9 }),
        savingsRate: faker.number.float({ min: 0.05, max: 0.3 }),
        bank: this.banks[faker.number.int({ min: 0, max: this.banks.length - 1 })],
        premiumStatus: faker.datatype.boolean(),
        device: faker.helpers.arrayElement(['iPhone 13', 'iPhone 14', 'Samsung S22', 'Samsung S23', 'Xiaomi Redmi Note 12']),
        platform: faker.helpers.arrayElement(['iOS', 'Android']),
        appVersion: faker.helpers.arrayElement(['1.0.0', '1.0.1', '1.1.0']),
        language: 'es-DO',
        persona: faker.helpers.arrayElement(this.personas)
      });
    }
    return users;
  }

  generateAccountsForUser(userId: string): Account[] {
    const accounts: Account[] = [];
    
    accounts.push({
      id: faker.string.uuid(),
      userId,
      type: 'Cuenta de ahorro',
      balance: faker.number.int({ min: 1000, max: 500000 }),
      number: faker.finance.accountNumber(10),
      currency: 'RD$'
    });

    if (faker.number.int({ min: 1, max: 100 }) <= 60) {
      accounts.push({
        id: faker.string.uuid(),
        userId,
        type: 'Tarjeta de crédito',
        balance: faker.number.int({ min: 0, max: 50000 }),
        number: faker.finance.creditCardNumber('visa'),
        currency: 'RD$'
      });
    }

    return accounts;
  }

  getMerchants(): Merchant[] {
    return this.merchantNames.map(m => ({
      id: faker.string.uuid(),
      name: m.name,
      category: m.category
    }));
  }
}
