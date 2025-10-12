import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Label } from 'idea-toolbox';
import { WrapperCustomFieldMeta } from '@models/wrappedCustomBlock.model';

@Component({
  selector: 'wrapper-custom-field-meta',
  template: `
    <ion-header>
      <ion-toolbar color="ideaToolbar">
        <ion-buttons slot="start">
          <ion-button [title]="'IDEA_COMMON.CUSTOM_FIELDS.CLOSE_WITHOUT_SAVING' | translate" (click)="close()">
            <ion-icon slot="icon-only" icon="close" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ 'IDEA_COMMON.CUSTOM_FIELDS.MANAGE_FIELD' | translate }}</ion-title>
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
      <ion-list class="aList ion-padding" [class.viewMode]="disabled" [class.editMode]="!disabled">
        @if (disabled) {
          <ion-list-header>
            <ion-label>
              <h2>
                {{ field.name | label }}
                @if (field.obligatory) {
                  <ion-text class="obligatoryDot" />
                }
              </h2>
              <ion-badge color="dark">{{ 'IDEA_COMMON.CUSTOM_FIELDS.FIELDS_TYPES.' + field.type | translate }}</ion-badge>
              @if (field.default && (field.type === CFT.STRING || field.type === CFT.NUMBER || field.type === CFT.ENUM)) {
                <ion-badge color="medium">
                  {{ 'IDEA_COMMON.CUSTOM_FIELDS.DEFAULT' | translate }}: {{ field.default }}
                </ion-badge>
              }
              @if (field.type === CFT.NUMBER) {
                <ion-badge color="medium"> {{ 'IDEA_COMMON.CUSTOM_FIELDS.MIN' | translate }}: {{ field.min }} </ion-badge>
              }
              @if (field.type === CFT.NUMBER) {
                <ion-badge color="medium"> {{ 'IDEA_COMMON.CUSTOM_FIELDS.MAX' | translate }}: {{ field.max }} </ion-badge>
              }
              <p>{{ field.description | label }}</p>
            </ion-label>
            @if (field.icon) {
              <ion-icon [name]="field.icon" />
            }
          </ion-list-header>
        }

        @if (!disabled) {
          <div>
            <ion-item [lines]="lines" [class.fieldHasError]="hasFieldAnError('name')">
              <ion-input
                type="text"
                readonly="true"
                labelPlacement="stacked"
                [value]="field.name | label"
                [placeholder]="'IDEA_COMMON.CUSTOM_FIELDS.NAME_HINT' | translate"
              >
                <div slot="label">
                  {{ 'IDEA_COMMON.CUSTOM_FIELDS.NAME' | translate }} <ion-text class="obligatoryDot" />
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

            <ion-item [lines]="lines" [class.fieldHasError]="hasFieldAnError('description')">
              <ion-input
                type="text"
                readonly="true"
                labelPlacement="stacked"
                [label]="'IDEA_COMMON.CUSTOM_FIELDS.DESCRIPTION' | translate"
                [value]="field.description | label"
                [placeholder]="'IDEA_COMMON.CUSTOM_FIELDS.DESCRIPTION_HINT' | translate"
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

            <ion-item [lines]="lines" [class.fieldHasError]="hasFieldAnError('icon')">
              <ion-input
                type="text"
                readonly="true"
                labelPlacement="stacked"
                [label]="'IDEA_COMMON.CUSTOM_FIELDS.ICON' | translate"
                [value]="field.icon"
                [placeholder]="'IDEA_COMMON.CUSTOM_FIELDS.ICON_HINT' | translate"
              />
              @if (field.icon) {
                <ion-badge slot="end" color="dark" class="marginTop">
                  <ion-icon [name]="field.icon" />
                </ion-badge>
              }
              <ion-button
                fill="clear"
                slot="end"
                class="marginTop"
                [title]="'COMMON.EDIT' | translate"
                (click)="editIcon()"
              >
                <ion-icon icon="pencil" slot="icon-only" />
              </ion-button>
            </ion-item>

            <ion-item [lines]="lines" [class.fieldHasError]="hasFieldAnError('type')">
              <ion-select
                labelPlacement="stacked"
                [label]="'IDEA_COMMON.CUSTOM_FIELDS.TYPE' | translate"
                [(ngModel)]="field.type"
              >
                @for (t of FIELD_TYPES; track t) {
                  <ion-select-option [value]="t">
                    {{ 'IDEA_COMMON.CUSTOM_FIELDS.FIELDS_TYPES.' + t | translate }}
                  </ion-select-option>
                }
              </ion-select>
            </ion-item>

            @if (field.type === CFT.STRING || field.type === CFT.NUMBER) {
              <ion-item [lines]="lines" [class.fieldHasError]="hasFieldAnError('default')">
                <ion-input
                  type="text"
                  labelPlacement="stacked"
                  [label]="'IDEA_COMMON.CUSTOM_FIELDS.DEFAULT' | translate"
                  [placeholder]="'IDEA_COMMON.CUSTOM_FIELDS.DEFAULT_HINT' | translate"
                  [(ngModel)]="field.default"
                />
              </ion-item>
            }

            @if (field.type === CFT.ENUM && !field.allowMultipleSelection) {
              <ion-item [lines]="lines" [class.fieldHasError]="hasFieldAnError('default')">
                <ion-select
                  labelPlacement="stacked"
                  [label]="'IDEA_COMMON.CUSTOM_FIELDS.DEFAULT_CHOICE' | translate"
                  [(ngModel)]="field.default"
                >
                  <ion-select-option [value]="null">
                    {{ 'IDEA_COMMON.CUSTOM_FIELDS.NO_DEFAULT_CHOICE' | translate }}
                  </ion-select-option>
                  @for (e of field.enum; track e) {
                    <ion-select-option [value]="e">
                      {{ getEnumElement(e) }}
                    </ion-select-option>
                  }
                </ion-select>
              </ion-item>
            }

            @if (field.type === CFT.ENUM && field.allowMultipleSelection) {
              <ion-item [lines]="lines" [class.fieldHasError]="hasFieldAnError('default')">
                <ion-select
                  multiple="true"
                  labelPlacement="stacked"
                  [label]="'Default Choices' | translate"
                  [(ngModel)]="multiSelectDefaults"
                  (ngModelChange)="updateMultiSelectDefault()"
                >
                  @for (e of field.enum; track e) {
                    <ion-select-option [value]="e">
                      {{ getEnumElement(e) }}
                    </ion-select-option>
                  }
                </ion-select>
              </ion-item>
            }

            @if (field.type === CFT.NUMBER) {
              <ion-item [lines]="lines" [class.fieldHasError]="hasFieldAnError('min')">
                <ion-input
                  type="number"
                  labelPlacement="stacked"
                  [label]="'IDEA_COMMON.CUSTOM_FIELDS.MIN' | translate"
                  [placeholder]="'IDEA_COMMON.CUSTOM_FIELDS.MIN_HINT' | translate"
                  [(ngModel)]="field.min"
                />
              </ion-item>
            }

            @if (field.type === CFT.NUMBER) {
              <ion-item [lines]="lines" [class.fieldHasError]="hasFieldAnError('max')">
                <ion-input
                  type="number"
                  labelPlacement="stacked"
                  [label]="'IDEA_COMMON.CUSTOM_FIELDS.MAX' | translate"
                  [placeholder]="'IDEA_COMMON.CUSTOM_FIELDS.MAX_HINT' | translate"
                  [(ngModel)]="field.max"
                />
              </ion-item>
            }
          </div>
        }
      </ion-list>

      @if (!disabled) {
        <ion-list class="obligatoryToggleList">
          <ion-item lines="none">
            <ion-toggle justify="end" [(ngModel)]="field.obligatory">
              {{ 'IDEA_COMMON.CUSTOM_FIELDS.OBLIGATORY' | translate }}
            </ion-toggle>
          </ion-item>

          @if (field.type === CFT.ENUM) {
            <ion-item lines="none">
              <ion-toggle justify="end" [(ngModel)]="field.allowMultipleSelection">
                Allow Multiple Selection
              </ion-toggle>
            </ion-item>
          }
        </ion-list>
      }

      @if (field.type === CFT.ENUM) {
        <ion-list class="aList ion-padding">
          <ion-list-header>
            <ion-label>
              <h3>{{ 'IDEA_COMMON.CUSTOM_FIELDS.OPTIONS' | translate }}</h3>
            </ion-label>
          </ion-list-header>
          @if (!field.enum?.length) {
            <ion-item lines="none" [class.fieldHasError]="hasFieldAnError('enum')">
              <ion-label>
                <i>{{ 'IDEA_COMMON.CUSTOM_FIELDS.NO_ELEMENTS' | translate }}</i>
              </ion-label>
            </ion-item>
          }
          <ion-reorder-group [disabled]="disabled" (ionItemReorder)="reorderOptions($event)">
            @for (e of field.enum; track e; let index = $index) {
              <ion-item [lines]="lines" [class.fieldHasError]="hasFieldAnError('enum.' + index)">
                @if (!disabled) {
                  <ion-reorder slot="start" />
                }
                <ion-label>{{ getEnumElement(e) }}</ion-label>
                @if (!disabled) {
                  <ion-button slot="end" fill="clear" [title]="'COMMON.EDIT' | translate" (click)="editEnumLabel(e)">
                    <ion-icon icon="pencil" slot="icon-only" />
                  </ion-button>
                }
                @if (!disabled) {
                  <ion-button
                    slot="end"
                    fill="clear"
                    color="danger"
                    [title]="'IDEA_COMMON.CUSTOM_FIELDS.REMOVE_OPTION' | translate"
                    (click)="removeOptionByIndex(index)"
                  >
                    <ion-icon icon="trash-outline" slot="icon-only" />
                  </ion-button>
                }
              </ion-item>
            }
          </ion-reorder-group>
          @if (!disabled) {
            <ion-row>
              <ion-col class="ion-padding ion-text-center">
                <ion-button
                  size="small"
                  color="medium"
                  [title]="'IDEA_COMMON.CUSTOM_FIELDS.ADD_OPTION_HINT' | translate"
                  (click)="addOption()"
                >
                  {{ 'IDEA_COMMON.CUSTOM_FIELDS.ADD_OPTION' | translate }}
                </ion-button>
              </ion-col>
            </ion-row>
          }
        </ion-list>
      }

      @if (!disabled) {
        <ion-list class="aList ion-padding">
          <ion-list-header>
            <ion-label>
              <h3>Visibility Options</h3>
            </ion-label>
          </ion-list-header>

          <ion-item [lines]="lines">
            <ion-label>Visible to ESNers</ion-label>
            <ion-checkbox slot="end" [(ngModel)]="visibleToESNers" />
          </ion-item>

          <ion-item [lines]="lines">
            <ion-label>Visible to Externals</ion-label>
            <ion-checkbox slot="end" [(ngModel)]="visibleToExternals" />
          </ion-item>

          <ion-item [lines]="lines">
            <ion-label slot="start">Show only if:</ion-label>
            <ion-select slot="end" [(ngModel)]="showIfField" placeholder="Always show" interface="popover">
              <ion-select-option value="">Always show</ion-select-option>
              @for (availableField of availableFields; track availableField.key) {
                <ion-select-option [value]="availableField.key">
                  {{ availableField.label }}
                </ion-select-option>
              }
            </ion-select>
          </ion-item>
        </ion-list>
      }
    </ion-content>
  `
})
export class WrapperCustomFieldMetaComponent implements OnInit {
  @Input() field: WrapperCustomFieldMeta;
  @Input() disabled = false;
  @Input() lines: string;
  @Input() allFields: WrapperCustomFieldMeta[] = [];
  @Input() currentFieldKey: string = '';
  @Input() currentSectionKey: string = '';

  visibleToESNers = true;
  visibleToExternals = true;
  showIfField = '';
  availableFields: { key: string; label: string; type: string }[] = [];

  errors = new Set<string>();
  FIELD_TYPES: string[] = ['STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'ENUM'];
  CFT = { STRING: 'STRING', NUMBER: 'NUMBER', BOOLEAN: 'BOOLEAN',
          DATE: 'DATE', ENUM: 'ENUM' };
  multiSelectDefaults: string[] = [];
  constructor(private _modal: ModalController) {}

  ngOnInit() {
    const opts = this.field?.visibilityOptions;
    if (opts) {
      this.visibleToESNers = opts.visibleTo === 'both' || opts.visibleTo === 'esners';
      this.visibleToExternals = opts.visibleTo === 'both' || opts.visibleTo === 'externals';
      this.showIfField = opts.showIfField || '';
    }

    this.buildAvailableFields();

    if (this.field.type === this.CFT.ENUM && this.field.allowMultipleSelection && this.field.default) {
      this.multiSelectDefaults = this.field.default.split(', ');
    }
  }

  updateMultiSelectDefault() {
    if (this.field.type === this.CFT.ENUM && this.field.allowMultipleSelection) {
      this.field.default = this.multiSelectDefaults.length > 0 ? this.multiSelectDefaults.join(', ') : '';
    }
  }

  private buildAvailableFields() {
    this.availableFields = [];
    if (!this.allFields || this.allFields.length === 0) return;

    this.allFields.forEach(field => {
      if (field.key === `${this.currentSectionKey}.${this.currentFieldKey}`) {
        return;
      }

      let fieldName = 'Unnamed Field';
      if (field.name) {
        if (typeof field.name === 'string') {
          fieldName = field.name;
        } else if (field.name.en) {
          fieldName = field.name.en;
        } else {
          const firstLang = Object.keys(field.name)[0];
          fieldName = field.name[firstLang] || 'Unnamed Field';
        }
      }

      this.availableFields.push({
        key: field.key || 'unknownField',
        label: fieldName,
        type: field.type || 'STRING'
      });
    });

    this.availableFields.sort((a, b) => a.label.localeCompare(b.label));
  }

  save() {
    let visibleTo: 'both' | 'esners' | 'externals';
    if (this.visibleToESNers && this.visibleToExternals) {
      visibleTo = 'both';
    } else if (this.visibleToESNers) {
      visibleTo = 'esners';
    } else {
      visibleTo = 'externals';
    }

    this.field.visibilityOptions = {
      visibleTo,
      showIfField: this.showIfField || undefined,
      showIfValue: this.showIfField ? true : undefined
    };

    this._modal.dismiss(this.field);
  }

  close() {
    this._modal.dismiss();
  }

  hasFieldAnError(field: string): boolean {
    return this.errors.has(field);
  }

  editName(): void {
    const currentName = this.field.name?.en || '';
    const newName = prompt('Field name:', currentName);
    if (newName !== null && newName.trim()) {
      if (!this.field.name) {
        this.field.name = new Label({ en: newName.trim() });
      } else {
        this.field.name.en = newName.trim();
      }
    }
  }

  editDescription(): void {
    const currentDesc = this.field.description?.en || '';
    const newDesc = prompt('Field description:', currentDesc);
    if (newDesc !== null) {
      if (!this.field.description) {
        this.field.description = new Label({ en: newDesc.trim() });
      } else {
        this.field.description.en = newDesc.trim();
      }
    }
  }

  editIcon(): void {
    const icon = prompt('Icon name (ionicons):', this.field.icon || '');
    if (icon !== null) {
      this.field.icon = icon;
    }
  }

  reorderOptions(ev: any): void {
    if (this.field.enum) {
      this.field.enum = ev.detail.complete(this.field.enum);
    }
  }

  async removeOptionByIndex(index: number): Promise<void> {
    if (confirm('Are you sure?')) {
      if (this.field.enum) {
        const e = this.field.enum[index];
        if (this.field.enumLabels) delete this.field.enumLabels[e];
        this.field.enum.splice(index, 1);
      }
    }
  }

  async addOption(): Promise<void> {
    const enumValue = prompt('Option value:');
    if (enumValue) {
      if (!this.field.enum) this.field.enum = [];
      if (!this.field.enumLabels) this.field.enumLabels = {};

      this.field.enum.push(enumValue);
      this.field.enumLabels[enumValue] = new Label({ en: enumValue });
    }
  }

  editEnumLabel(theEnum: string): void {
    const currentLabel = this.field.enumLabels?.[theEnum]?.en || theEnum;
    const newLabel = prompt('Option label:', currentLabel);
    if (newLabel !== null && newLabel.trim()) {
      if (!this.field.enumLabels) this.field.enumLabels = {};
      if (!this.field.enumLabels[theEnum]) {
        this.field.enumLabels[theEnum] = new Label({ en: newLabel.trim() });
      } else {
        this.field.enumLabels[theEnum].en = newLabel.trim();
      }
    }
  }

  getEnumElement(enumValue: string): string {
    return this.field.enumLabels?.[enumValue]?.en || enumValue;
  }
}