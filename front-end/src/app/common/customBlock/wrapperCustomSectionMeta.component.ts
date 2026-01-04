import { Component, Input, OnInit, inject } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular/standalone';
import { CustomFieldTypes, Label, Languages } from 'idea-toolbox';
import { IDEATranslatePipe, IDEALocalizedLabelPipe } from '@idea-ionic/common';
import { WrapperCustomFieldMeta, WrapperCustomSectionMeta } from '@models/wrappedCustomBlock.model';
import { WrapperCustomFieldMetaComponent } from './wrapperCustomFieldMeta.component';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent, IonList, IonListHeader, IonLabel, IonText, IonItem, IonInput, IonBadge, IonReorderGroup, IonReorder, IonRow, IonCol, IonItemDivider } from '@ionic/angular/standalone';

@Component({
  selector: 'wrapper-custom-section-meta',
  imports: [
    // IDEA
    IDEATranslatePipe,
    IDEALocalizedLabelPipe,
    // Ionic
    IonBadge,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonList,
    IonListHeader,
    IonReorder,
    IonReorderGroup,
    IonRow,
    IonText,
    IonTitle,
    IonToolbar
  ],
  template: `
    <ion-header>
      <ion-toolbar color="ideaToolbar">
        <ion-buttons slot="start">
          <ion-button [title]="'IDEA_COMMON.CUSTOM_FIELDS.CLOSE_WITHOUT_SAVING' | translate" (click)="close()">
            <ion-icon slot="icon-only" icon="close" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ 'IDEA_COMMON.CUSTOM_FIELDS.MANAGE_SECTION' | translate }}</ion-title>
        @if (!disabled) {
          <ion-buttons slot="end">
            <ion-button [title]="'IDEA_COMMON.CUSTOM_FIELDS.SAVE_CHANGES' | translate" (click)="save()">
              <ion-icon slot="icon-only" icon="checkmark-circle" />
            </ion-button>
          </ion-buttons>
        }
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div [class.viewMode]="disabled" [class.editMode]="!disabled">
        <ion-list class="aList ion-padding">
          @if (!hideHeaders) {
            @if (disabled) {
              <ion-list-header>
                <ion-label>
                  <h2>{{ _section.name | label }}</h2>
                  <p>{{ _section.description | label }}</p>
                </ion-label>
              </ion-list-header>
            }
            @if (!disabled) {
              <ion-item [lines]="lines" [class.fieldHasError]="hasFieldAnError('name')">
                <ion-input
                  type="text"
                  readonly="true"
                  labelPlacement="stacked"
                  [value]="_section.name | label"
                  [placeholder]="'IDEA_COMMON.CUSTOM_FIELDS.SECTION_NAME_HINT' | translate"
                >
                  <div slot="label">
                    {{ 'IDEA_COMMON.CUSTOM_FIELDS.NAME' | translate }}
                    @if (!disabled) {
                      <ion-text class="obligatoryDot" />
                    }
                  </div>
                </ion-input>
                <ion-button
                  slot="end"
                  fill="clear"
                  class="marginTop"
                  [title]="'COMMON.EDIT' | translate"
                  (click)="editName()"
                >
                  <ion-icon slot="icon-only" icon="pencil" />
                </ion-button>
              </ion-item>
            }
            @if (!disabled) {
              <ion-item [lines]="lines" [class.fieldHasError]="hasFieldAnError('description')">
                <ion-input
                  type="text"
                  readonly="true"
                  labelPlacement="stacked"
                  [label]="'IDEA_COMMON.CUSTOM_FIELDS.DESCRIPTION' | translate"
                  [value]="_section.description | label"
                  [placeholder]="'IDEA_COMMON.CUSTOM_FIELDS.SECTION_DESCRIPTION_HINT' | translate"
                />
                <ion-button
                  slot="end"
                  fill="clear"
                  class="marginTop"
                  [title]="'COMMON.EDIT' | translate"
                  (click)="editDescription()"
                >
                  <ion-icon slot="icon-only" icon="pencil" />
                </ion-button>
              </ion-item>
            }
            <ion-list-header>
              <ion-label>
                <h3>{{ 'IDEA_COMMON.CUSTOM_FIELDS.SECTION_FIELDS' | translate }}</h3>
              </ion-label>
            </ion-list-header>
          }
          @if (!_section.fieldsLegend.length) {
            <ion-item lines="none">
              <ion-label>
                <i>{{ 'IDEA_COMMON.CUSTOM_FIELDS.NO_ELEMENTS' | translate }}</i>
              </ion-label>
            </ion-item>
          }
          <ion-reorder-group [disabled]="disabled" (ionItemReorder)="reorderFieldsLegend($event)">
            @for (f of _section.fieldsLegend; track f) {
              <ion-item [button]="true" [lines]="lines" (click)="openField(f)">
                @if (!disabled) {
                  <ion-reorder slot="start" />
                }
                <ion-label>
                  {{ _section.fields[f].name | label }}
                  @if (_section.fields[f].obligatory) {
                    <ion-text class="obligatoryDot" />
                  }
                  <p>{{ _section.fields[f].description | label }}</p>
                </ion-label>
                <ion-badge slot="end" color="medium">
                  {{ 'IDEA_COMMON.CUSTOM_FIELDS.FIELDS_TYPES.' + _section.fields[f].type | translate }}
                </ion-badge>
                @if (!disabled) {
                  <ion-button slot="end" fill="clear" color="danger" (click)="removeField(f, $event)">
                    <ion-icon icon="trash-outline" slot="icon-only" />
                  </ion-button>
                }
              </ion-item>
            }
          </ion-reorder-group>
          @if (!disabled) {
            <ion-row>
              <ion-col class="ion-padding ion-text-center">
                <ion-button size="small" color="primary" (click)="addNewField()">
                  {{ 'IDEA_COMMON.CUSTOM_FIELDS.ADD_FIELD' | translate }}
                </ion-button>
              </ion-col>
            </ion-row>
          }
        </ion-list>
        @if (useDisplayTemplate) {
          <ion-list class="aList ion-padding">
            <ion-list-header>
              <ion-label>
                <h3>{{ 'IDEA_COMMON.CUSTOM_FIELDS.DISPLAY_TEMPLATE' | translate }}</h3>
                <p>{{ 'IDEA_COMMON.CUSTOM_FIELDS.DISPLAY_TEMPLATE_I' | translate }}</p>
              </ion-label>
            </ion-list-header>
            @if (!_section.displayTemplate.length) {
              <ion-item lines="none">
                <ion-label>
                  <i>{{ 'IDEA_COMMON.CUSTOM_FIELDS.NO_ELEMENTS' | translate }}</i>
                </ion-label>
              </ion-item>
            }
            <ion-reorder-group [disabled]="disabled" (ionItemReorder)="reorderDisplayTemplateRows($event)">
              @for (row of _section.displayTemplate; track row; let rowIndex = $index) {
                <div class="displayTemplateRow">
                  <ion-item-divider>{{ 'IDEA_COMMON.CUSTOM_FIELDS.ROW' | translate }} {{ rowIndex + 1 }} </ion-item-divider>
                  <ion-item [lines]="lines">
                    @if (!disabled) {
                      <ion-reorder slot="start" />
                    }
                    <ion-label class="ion-text-wrap">
                      @for (field of row; track field) {
                        <div>
                          <ion-button
                            size="small"
                            fill="outline"
                            color="medium"
                            [disabled]="disabled"
                            (click)="removeFieldToDisplayTemplateRow(rowIndex, field)"
                          >
                            @if (!disabled) {
                              <ion-icon icon="close" slot="start" />
                            }
                            {{ _section.fields[field].name | label }}
                          </ion-button>
                        </div>
                      }
                    </ion-label>
                    @if (!disabled && !isDisplayTemplateRowFull(rowIndex)) {
                      <ion-button
                        slot="end"
                        fill="clear"
                        color="primary"
                        [title]="'IDEA_COMMON.CUSTOM_FIELDS.ADD_FIELD' | translate"
                        (click)="addFieldToDisplayTemplateRow(rowIndex)"
                      >
                        <ion-icon icon="add-circle-outline" />
                      </ion-button>
                    }
                  </ion-item>
                </div>
              }
            </ion-reorder-group>
            @if (!disabled) {
              <ion-row>
                <ion-col class="ion-padding ion-text-center">
                  <ion-button size="small" color="medium" (click)="addNewDisplayTemplateRow()">
                    {{ 'IDEA_COMMON.CUSTOM_FIELDS.ADD_ROW' | translate }}
                  </ion-button>
                </ion-col>
              </ion-row>
            }
          </ion-list>
        }
      </div>
    </ion-content>
  `
})
export class WrapperCustomSectionMetaComponent implements OnInit {
  private _modal = inject(ModalController);
  private _alert = inject(AlertController);

  private languages: Languages = new Languages({ default: 'en', available: ['en'] })

  @Input() section: WrapperCustomSectionMeta;
  @Input() hideHeaders = false;
  @Input() useDisplayTemplate = false;
  @Input() disabled = false;
  @Input() lines: string;
  @Input() allSections: any;
  @Input() currentSectionKey: string = '';

  _section: WrapperCustomSectionMeta;
  errors = new Set<string>();
  DISPLAY_TEMPLATE_MAX_NUM_FIELD_PER_ROW = 3;

  ngOnInit(): void {
    this._section = new WrapperCustomSectionMeta(this.section, this.languages);
    if (this.useDisplayTemplate && !this._section.displayTemplate) {
      this._section.displayTemplate = [];
    }
  }

  hasFieldAnError(field: string): boolean {
    return this.errors.has(field);
  }

  async editName(): Promise<void> {
    if (!this._section.name) {
      this._section.name = new Label({
        en: '-'
      }, this.languages);
    }
    await this.editLabel('Name', this._section.name);
  }

  async editDescription(): Promise<void> {
    if (!this._section.description) {
      this._section.description = new Label({
        en: '-'
      }, this.languages);
    }
    await this.editLabel('Description', this._section.description);
  }

  private async editLabel(title: string, label: Label): Promise<void> {
    const currentValue = label.en || '';
    const newValue = prompt(title + ':', currentValue);
    if (newValue !== null) {
      label.en = newValue.trim();
    }
  }

  reorderFieldsLegend(ev: any): void {
    this._section.fieldsLegend = ev.detail.complete(this._section.fieldsLegend);
  }

  async openField(f: string): Promise<void> {
    const componentProps = {
      field: this._section.fields[f],
      disabled: this.disabled,
      lines: this.lines,
      allFields: this.getAllAvailableFields(),
      currentFieldKey: f,
      currentSectionKey: this.currentSectionKey
    };
    const modal = await this._modal.create({
      component: WrapperCustomFieldMetaComponent,
      componentProps
    });
    await modal.present();
  }

  async removeField(f: string, ev: any): Promise<void> {
    if (ev) ev.stopPropagation();

    const doRemoveField = (): void => {
      this._section.fieldsLegend.splice(this._section.fieldsLegend.indexOf(f), 1);
      delete this._section.fields[f];
      if (this._section.displayTemplate) {
        this._section.displayTemplate.forEach(
          (row, i, arr): string[] => (arr[i] = row.filter(el => this._section.fieldsLegend.some(field => field === el)))
        );
      }
    };
    const header = 'Are you sure?';
    const buttons = [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Confirm', handler: doRemoveField }
    ];

    const alert = await this._alert.create({ header, buttons });
    await alert.present();
  }

  async addNewField(): Promise<void> {
    const doAddNewField = (data: any): Promise<void> => {
      const name = data ? data.name.trim() : null;
      if (!name) return;

      const key = name.replace(/[^\w]/g, '');
      if (!key.trim()) return;

      if (this._section.fieldsLegend.some(x => x === key)) {
        return;
      }

      const field = new WrapperCustomFieldMeta({
        name: {en: name},
        description: { en: ''},
        type: CustomFieldTypes.STRING,
        obligatory: false
      }, this.languages);

      this._section.fields[key] = field;
      this._section.fieldsLegend.push(key);
      this.openField(key);
    };

    const header = 'Add Field';
    const message = 'Choose a name for the new field';
    const inputs: any = [{ name: 'name', type: 'text' }];
    const buttons = [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Confirm', handler: doAddNewField }
    ];

    const alert = await this._alert.create({ header, message, inputs, buttons });
    await alert.present();

    const firstInput: HTMLInputElement = document.querySelector('ion-alert input');
    if (firstInput) firstInput.focus();
  }

  reorderDisplayTemplateRows(ev: any): void {
    this._section.displayTemplate = ev.detail.complete(this._section.displayTemplate);
  }

  isDisplayTemplateRowFull(row: number): boolean {
    return this._section.displayTemplate[row].length === this.DISPLAY_TEMPLATE_MAX_NUM_FIELD_PER_ROW;
  }

  addNewDisplayTemplateRow(): void {
    this._section.displayTemplate.push([]);
  }

  async addFieldToDisplayTemplateRow(row: number): Promise<void> {
    const availableFields = this._section.fieldsLegend.filter(
      x => !this._section.displayTemplate[row].includes(x)
    );

    if (availableFields.length === 0) return;

    const field = availableFields[0];
    this._section.displayTemplate[row].push(field);
  }

  removeFieldToDisplayTemplateRow(row: number, field: string): void {
    this._section.displayTemplate[row].splice(this._section.displayTemplate[row].indexOf(field), 1);
  }

  private cleanEmptyDisplayTemplateRows(): void {
    this._section.displayTemplate = this._section.displayTemplate.filter(r => r.length);
  }

  private getAllAvailableFields(): WrapperCustomFieldMeta[] {
    const allFields: WrapperCustomFieldMeta[] = [];
    if (!this.allSections) return allFields;

    Object.keys(this.allSections).forEach(sectionKey => {
      const section = this.allSections[sectionKey];
      if (section.fieldsLegend && section.fields) {
        section.fieldsLegend.forEach(fieldKey => {
          const field = { ...section.fields[fieldKey] };
          field.key = `${sectionKey}.${fieldKey}`;
          allFields.push(field);
        });
      }
    });
    return allFields;
  }

  save(): Promise<void> {
    this.errors = new Set(this._section.validate(this.languages));
    if (this.errors.size) {
      alert('Form has errors to check');
      return;
    }

    if (this.useDisplayTemplate) this.cleanEmptyDisplayTemplateRows();

    this.section.load(this._section, this.languages);
    this.close();
  }

  close(): void {
    this._modal.dismiss();
  }
}