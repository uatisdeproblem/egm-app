import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { Configurations, DocumentTemplates, EmailTemplates } from '@models/configurations.model';

@Injectable({ providedIn: 'root' })
export class ConfigurationsService {
  constructor(private api: IDEAApiService) {}

  /**
   * Update the app's configurations.
   */
  async update(configurations: Configurations): Promise<Configurations> {
    return new Configurations(await this.api.putResource('configurations', { body: configurations }));
  }

  /**
   * Set a new email template.
   */
  async setEmailTemplate(template: EmailTemplates, subject: string, content: string): Promise<void> {
    const action = 'SET_EMAIL_TEMPLATE_'.concat(template);
    await this.api.patchResource('configurations', { body: { action, subject, content } });
  }
  /**
   * Reset the email template.
   */
  async resetEmailTemplate(template: EmailTemplates): Promise<void> {
    const action = 'RESET_EMAIL_TEMPLATE_'.concat(template);
    await this.api.patchResource('configurations', { body: { action } });
  }
  /**
   * Get the email template.
   */
  async getEmailTemplate(template: EmailTemplates): Promise<{ subject: string; content: string }> {
    const action = 'GET_EMAIL_TEMPLATE_'.concat(template);
    return await this.api.patchResource('configurations', { body: { action } });
  }
  /**
   * Test the email template.
   */
  async testEmailTemplate(template: EmailTemplates): Promise<void> {
    const action = 'TEST_EMAIL_TEMPLATE_'.concat(template);
    return await this.api.patchResource('configurations', { body: { action } });
  }

  /**
   * Set a new document template.
   */
  async setDocumentTemplate(template: DocumentTemplates, content: string): Promise<void> {
    const action = 'SET_DOCUMENT_TEMPLATE_'.concat(template);
    await this.api.patchResource('configurations', { body: { action, content } });
  }
  /**
   * Reset the document template.
   */
  async resetDocumentTemplate(template: DocumentTemplates): Promise<void> {
    const action = 'RESET_DOCUMENT_TEMPLATE_'.concat(template);
    await this.api.patchResource('configurations', { body: { action } });
  }
  /**
   * Get the document template.
   */
  async getDocumentTemplate(template: DocumentTemplates): Promise<{ subject: string; content: string }> {
    const action = 'GET_DOCUMENT_TEMPLATE_'.concat(template);
    return await this.api.patchResource('configurations', { body: { action } });
  }
  /**
   * Test the document template.
   */
  async testDocumentTemplate(template: DocumentTemplates): Promise<void> {
    const action = 'TEST_DOCUMENT_TEMPLATE_'.concat(template);
    return await this.api.patchResource('configurations', { body: { action } });
  }
}
