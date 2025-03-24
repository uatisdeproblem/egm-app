import { Component } from '@angular/core';
import { IDEATranslationsService } from '@idea-ionic/common';

@Component({
  selector: 'privacy-page',
  templateUrl: 'privacy-policy.page.html',
  styleUrls: ['privacy-policy.page.scss']
})
export class PrivacyPage {
  constructor(protected t: IDEATranslationsService) {}

}
