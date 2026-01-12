import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import '@angular/compiler';

import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { IonicStorageModule } from '@ionic/storage-angular';
import { IDEAEnvironment } from '@idea-ionic/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';

registerLocaleData(localeIt, 'it');

if (!environment.debug) enableProdMode();

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: IDEAEnvironment, useValue: environment },
    provideIonicAngular(),
    provideHttpClient(),
    importProvidersFrom(
      IonicStorageModule.forRoot({ name: 'egm-app' }),
      ZXingScannerModule
    ),
  ]
}).catch(err => console.log(err));
