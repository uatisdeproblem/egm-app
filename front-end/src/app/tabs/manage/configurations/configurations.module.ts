import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEACustomFieldsModule, IDEAListModule, IDEATranslationsModule } from '@idea-ionic/common';

import { ConfigurationsRoutingModule } from './configurations-routing.module';

import { RegistrationsConfigurationsPage } from './registrations/registrationsConfig.page';
import { EmailTemplateModule } from './emailTemplate/emailTemplate.module';
import { WrapperCustomSectionMetaComponent } from '@app/common/customBlock/wrapperCustomSectionMeta.component';
import { WrapperCustomFieldMetaComponent } from '@app/common/customBlock/wrapperCustomFieldMeta.component';
import { WrapperCustomBlockComponent } from '@app/common/customBlock/wrapperCustomBlock.component';
import { WrapperCustomBlockMetaComponent } from '@app/common/customBlock/wrapperCustomBlockMeta.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    IDEACustomFieldsModule,
    IDEAListModule,
    ConfigurationsRoutingModule,
    EmailTemplateModule
  ],
  declarations: [RegistrationsConfigurationsPage,
                 WrapperCustomBlockMetaComponent,
                 WrapperCustomSectionMetaComponent,
                 WrapperCustomFieldMetaComponent]
})
export class ConfigurationsModule {}
