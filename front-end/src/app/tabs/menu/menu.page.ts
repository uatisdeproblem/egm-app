import { Component } from '@angular/core';

import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss']
})
export class MenuPage {
  constructor(public app: AppService) {}
}