import { Component } from '@angular/core';
import { IDEATranslationsService } from '@idea-ionic/common';

@Component({
  selector: 'terms-page',
  templateUrl: 'terms.page.html',
  styleUrls: ['terms.page.scss']
})
export class TermsPage {
  constructor(protected t: IDEATranslationsService) {}

}
