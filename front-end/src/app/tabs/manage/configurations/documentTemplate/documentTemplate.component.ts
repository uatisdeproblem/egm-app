import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { isEmpty } from 'idea-toolbox';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { ConfigurationsService } from '../configurations.service';

import { DocumentTemplates } from '@models/configurations.model';

@Component({
  selector: 'app-document-template',
  templateUrl: 'documentTemplate.component.html',
  styleUrls: ['documentTemplate.component.scss']
})
export class DocumentTemplateComponent implements OnInit {
  /**
   * The email template to manage.
   */
  @Input() template: DocumentTemplates;

  content: string;

  @Input() variables: { code: string; description: string }[];

  errors: Set<string> = new Set();

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private t: IDEATranslationsService,
    private _configurations: ConfigurationsService,
    private app: AppService
  ) {}
  async ngOnInit(): Promise<void> {
    try {
      const { content } = await this.getTemplate();
      this.content = content;
    } catch (error) {
      this.content = '';
    }
    // @todo check vars
    this.variables = [
      { code: 'user', description: this.t._('MANAGE.DOCUMENT_TEMPLATE.VARIABLES.USER') },
      { code: 'country', description: this.t._('MANAGE.DOCUMENT_TEMPLATE.VARIABLES.COUNTRY') },
      { code: 'section', description: this.t._('MANAGE.DOCUMENT_TEMPLATE.VARIABLES.SECTION') },
      { code: 'spotType', description: this.t._('MANAGE.DOCUMENT_TEMPLATE.VARIABLES.SPOT_TYPE') },
      { code: 'spotId', description: this.t._('MANAGE.DOCUMENT_TEMPLATE.VARIABLES.SPOT_ID') },
      { code: 'price', description: this.t._('MANAGE.DOCUMENT_TEMPLATE.VARIABLES.PRICE') },
      { code: 'url', description: this.t._('MANAGE.DOCUMENT_TEMPLATE.VARIABLES.URL') }
    ];
  }

  hasFieldAnError(field: string): boolean {
    return this.errors.has(field);
  }

  async save(): Promise<void> {
    this.errors = new Set();
    if (isEmpty(this.content)) this.errors.add('content');
    if (this.errors.size) return this.message.warning('COMMON.FORM_HAS_ERROR_TO_CHECK');
    try {
      await this.loading.show();
      await this._configurations.setDocumentTemplate(this.template, this.content);
      this.message.success('COMMON.OPERATION_COMPLETED');
      this.modalCtrl.dismiss();
    } catch (error) {
      this.message.error('COMMON.SOMETHING_WENT_WRONG');
    } finally {
      this.loading.hide();
    }
  }

  browseHTMLFile(): void {
    document.getElementById('htmlFileInput')?.click();
  }
  async loadTemplateFromFile(inputEl: HTMLInputElement): Promise<void> {
    if (!inputEl?.files?.length) return;
    const file = inputEl.files[0];
    if (!file) return this.message.error('COMMON.SOMETHING_WENT_WRONG');
    const fileReader = new FileReader();
    fileReader.onerror = (): Promise<void> => this.message.error('COMMON.SOMETHING_WENT_WRONG');
    fileReader.onload = event => (this.content = String(event.target.result));
    fileReader.readAsText(file, 'utf-8');
  }

  async askAndResetTemplate(): Promise<void> {
    const doReset = async (): Promise<void> => {
      try {
        await this.loading.show();
        await this._configurations.resetDocumentTemplate(this.template);
        this.message.success('COMMON.OPERATION_COMPLETED');
        this.modalCtrl.dismiss();
      } catch (error) {
        this.message.error('COMMON.OPERATION_FAILED');
      } finally {
        this.loading.hide();
      }
    };

    const header = this.t._('COMMON.ARE_YOU_SURE');
    const buttons = [{ text: this.t._('COMMON.CANCEL') }, { text: this.t._('COMMON.CONFIRM'), handler: doReset }];
    const alert = await this.alertCtrl.create({ header, buttons });
    alert.present();
  }

  async downloadTemplate(): Promise<void> {
    const { content } = await this.getTemplate();
    this.app.downloadDataAsFile(content, 'text/html', this.template.concat('.html'));
  }
  async getTemplate(): Promise<{ subject: string; content: string }> {
    try {
      await this.loading.show();
      return await this._configurations.getDocumentTemplate(this.template);
    } catch (error) {
      this.message.error('COMMON.SOMETHING_WENT_WRONG');
    } finally {
      this.loading.hide();
    }
  }

  async askAndDownloadTestDocumentWithCurrentTemplate(): Promise<void> {
    const doSend = async (): Promise<void> => {
      try {
        await this.loading.show();
        await this._configurations.testDocumentTemplate(this.template);
        this.message.success('MANAGE.DOCUMENT_TEMPLATE.EMAIL_SENT');
      } catch (error) {
        this.message.error('MANAGE.DOCUMENT_TEMPLATE.BAD_TEMPLATE');
      } finally {
        this.loading.hide();
      }
    };

    const header = this.t._('MANAGE.DOCUMENT_TEMPLATE.TEST_TEMPLATE');
    const message = this.t._('MANAGE.DOCUMENT_TEMPLATE.TEST_TEMPLATE_I');
    const buttons = [{ text: this.t._('COMMON.CANCEL') }, { text: this.t._('COMMON.SEND'), handler: doSend }];

    const alert = await this.alertCtrl.create({ header, message, buttons });
    alert.present();
  }

  close(): void {
    this.modalCtrl.dismiss();
  }
}