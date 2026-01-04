import { Component, Input, inject } from '@angular/core';
import { ModalController, AlertController, IonItem, IonLabel, IonButton, IonIcon, IonReorderGroup, IonReorder, IonCol, IonRow } from '@ionic/angular/standalone';
import { IDEATranslatePipe, IDEALocalizedLabelPipe } from '@idea-ionic/common';
import { Languages } from 'idea-toolbox';
import { WrapperCustomBlockMeta, WrapperCustomSectionMeta } from '@models/wrappedCustomBlock.model';
import { WrapperCustomSectionMetaComponent } from './wrapperCustomSectionMeta.component';

@Component({
  selector: 'wrapper-custom-block-meta',
  imports: [
    // IDEA
    IDEATranslatePipe,
    IDEALocalizedLabelPipe,
    // Ionic
    IonButton,
    IonCol,
    IonIcon,
    IonItem,
    IonLabel,
    IonReorder,
    IonReorderGroup,
    IonRow
  ],
  template: `
    @if (!block.sectionsLegend.length) {
      <ion-item lines="none">
        <ion-label>
          <i>{{ 'IDEA_COMMON.CUSTOM_FIELDS.NO_ELEMENTS' | translate }}</i>
        </ion-label>
      </ion-item>
    }
    <ion-reorder-group [disabled]="disabled" (ionItemReorder)="reorderSectionsLegend($event)">
      @for (s of block.sectionsLegend; track s) {
        <ion-item button detail [lines]="lines" (click)="openSection(s)">
          @if (!disabled) {
            <ion-reorder slot="start" />
          }
          <ion-label>
            {{ block.sections[s].name | label }}
            <p>{{ block.sections[s].description | label }}</p>
          </ion-label>
          @if (!disabled) {
            <ion-button slot="end" fill="clear" color="danger" (click)="removeSection(s, $event)">
              <ion-icon icon="trash-outline" slot="icon-only" />
            </ion-button>
          }
        </ion-item>
      }
    </ion-reorder-group>
    @if (!disabled) {
      <ion-row>
        <ion-col class="ion-padding ion-text-center">
          <ion-button size="small" color="primary" (click)="addNewSection()">
            {{ 'IDEA_COMMON.CUSTOM_FIELDS.ADD_SECTION' | translate }}
          </ion-button>
        </ion-col>
      </ion-row>
    }
  `
})
export class WrapperCustomBlockMetaComponent {
  private _modal = inject(ModalController);
  private _alert = inject(AlertController);

  private languages: Languages = new Languages({ default: 'en', available: ['en'] })

  @Input() block: WrapperCustomBlockMeta;
  @Input() useDisplayTemplate = false;
  @Input() disabled = false;
  @Input() lines: string;

  reorderSectionsLegend(ev: any): void {
    this.block.sectionsLegend = ev.detail.complete(this.block.sectionsLegend);
  }

  async openSection(sectionKey: string): Promise<void> {
    const componentProps = {
      section: this.block.sections[sectionKey],
      useDisplayTemplate: this.useDisplayTemplate,
      disabled: this.disabled,
      lines: this.lines,
      allSections: this.block.sections,
      currentSectionKey: sectionKey
    };
    const modal = await this._modal.create({
      component: WrapperCustomSectionMetaComponent,
      componentProps
    });
    await modal.present();
  }

  async removeSection(s: string, ev: any): Promise<void> {
    if (ev) ev.stopPropagation();

    const doRemoveSection = (): void => {
      this.block.sectionsLegend.splice(this.block.sectionsLegend.indexOf(s), 1);
      delete this.block.sections[s];
    };
    const buttons = [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Confirm', handler: doRemoveSection }
    ];
    const header = 'Are you sure?';
    const alert = await this._alert.create({ header, buttons });
    await alert.present();
  }

  async addNewSection(): Promise<void> {
    const doAddNewSection = (data: any): Promise<void> => {
      if (!data.name) return;
      const name = data ? data.name.trim() : null;
      if (!name) return;
      const key = name.replace(/[^\w]/g, '');
      if (!key.trim()) return;
      if (this.block.sectionsLegend.some(x => x === key)) {
        return;
      }

      const section = new WrapperCustomSectionMeta({
        name: { en: name},
        description: { en: ''},
        fieldsLegend: [],
        fields: {},
        displayTemplate: []
      }, this.languages);

      this.block.sections[key] = section;
      this.block.sectionsLegend.push(key);
      this.openSection(key);
    };

    const header = 'Add Section';
    const message = 'Choose a name for the new section';
    const inputs: any = [{ name: 'name', type: 'text' }];
    const buttons = [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Confirm', handler: doAddNewSection }
    ];

    const alert = await this._alert.create({ header, message, inputs, buttons });
    await alert.present();

    const firstInput: any = document.querySelector('ion-alert input');
    firstInput.focus();
  }
}