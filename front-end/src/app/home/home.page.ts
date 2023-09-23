import { Component } from '@angular/core';

import { AppService } from '../app.service';

@Component({
  selector: 'home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  constructor(public app: AppService) {}
}
