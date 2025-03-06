import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { manageGuard } from '../manage.guard';
import { spotGuard } from '../spot.guard';
import { mealGuard } from '../meal.guard';
import { TabsComponent } from './tabs.component';

const routes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'user',
        loadChildren: (): Promise<any> => import('./user/user.module').then(m => m.UserModule)
      },
      {
        path: 'manage',
        loadChildren: (): Promise<any> => import('./manage/manage.module').then(m => m.ManageModule),
        canActivate: [manageGuard]
      },
      {
        path: 'home',
        loadChildren: (): Promise<any> => import('./home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'menu',
        loadChildren: (): Promise<any> => import('./menu/menu.module').then(m => m.MenuModule),
        canActivate: [spotGuard]
      },
      {
        path: 'venues',
        loadChildren: (): Promise<any> => import('./venues/venues.module').then(m => m.VenuesModule),
        canActivate: [spotGuard]
      },
      {
        path: 'rooms',
        loadChildren: (): Promise<any> => import('./rooms/rooms.module').then(m => m.RoomsModule),
        canActivate: [spotGuard]
      },
      {
        path: 'organizations',
        loadChildren: (): Promise<any> =>
          import('./organizations/organizations.module').then(m => m.OrganizationsModule),
        canActivate: [spotGuard]
      },
      {
        path: 'speakers',
        loadChildren: (): Promise<any> => import('./speakers/speakers.module').then(m => m.SpeakersModule),
        canActivate: [spotGuard]
      },
      {
        path: 'agenda',
        loadChildren: (): Promise<any> => import('./sessions/sessions.module').then(m => m.SessionsModule),
        canActivate: [spotGuard]
      },
      {
        path: 'contests',
        loadChildren: (): Promise<any> => import('./contests/contests.module').then(m => m.ContestsModule),
        canActivate: [spotGuard]
      },
      {
        path: 'meals',
        loadChildren: (): Promise<any> => import('./meals/meals.module').then(m => m.MealsModule),
        canActivate: [mealGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class TabsComponentRoutingModule {}
