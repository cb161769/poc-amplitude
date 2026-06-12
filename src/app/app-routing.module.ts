import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'developer',
    loadComponent: () => import('./features/developer/developer.component').then(m => m.DeveloperComponent)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./features/tabs/tabs.component').then(m => m.TabsComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'accounts',
        loadComponent: () => import('./features/accounts/accounts.component').then(m => m.AccountsComponent)
      },
      {
        path: 'transfers',
        loadComponent: () => import('./features/transfers/transfers.component').then(m => m.TransfersComponent)
      },
      {
        path: 'activity',
        loadComponent: () => import('./features/activity/activity.component').then(m => m.ActivityComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: '',
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
