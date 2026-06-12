import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { home, wallet, swapHorizontal, list, person } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" color="dark">
        <ion-tab-button tab="dashboard">
          <ion-icon name="home"></ion-icon>
          <ion-label>Inicio</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="accounts">
          <ion-icon name="wallet"></ion-icon>
          <ion-label>Productos</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="transfers">
          <ion-icon name="swap-horizontal"></ion-icon>
          <ion-label>Pagos</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="activity">
          <ion-icon name="list"></ion-icon>
          <ion-label>Actividad</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile">
          <ion-icon name="person"></ion-icon>
          <ion-label>Perfil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  standalone: true,
  imports: [IonicModule]
})
export class TabsComponent {
  constructor() {
    addIcons({ home, wallet, swapHorizontal, list, person });
  }
}
