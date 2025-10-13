import { Component, Input, OnInit, inject, EventEmitter, Output, DoCheck } from '@angular/core';
import { AppService } from '@app/app.service';
import { WrapperCustomFieldMeta, WrapperCustomBlockMeta, VisibilityOptions } from '@models/wrappedCustomBlock.model';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'wrapper-custom-block',
  template: `
    @for (s of filteredBlockMeta?.sectionsLegend; track s) {
      <ion-list class="aList customBlockList">
        <ion-list-header>
          <ion-label>
            <h2 [attr.toc]="filteredBlockMeta.sections[s].name | label">{{ filteredBlockMeta.sections[s].name | label }}</h2>
            <p>{{ filteredBlockMeta.sections[s].description | label }}</p>
          </ion-label>
        </ion-list-header>
        @for (f of filteredBlockMeta.sections[s].fieldsLegend; track f) {
          <div>
            @if (filteredBlockMeta.sections[s].fields[f].type === 'ENUM' &&
                 !filteredBlockMeta.sections[s].fields[f].allowMultipleSelection) {
              <idea-select
                [data]="getEnumSuggestions(s, f)"
                [lines]="lines"
                [description]="getEnumElementDescription(s, f)"
                [label]="filteredBlockMeta.sections[s].fields[f].name | label"
                [icon]="!hideDescriptions && !disabled ? 'help-circle-outline' : null"
                [iconColor]="hasFieldDescription(s, f) ? 'primary' : 'medium'"
                [placeholder]="'COMMON.TAP_TO_SELECT' | translate"
                [searchPlaceholder]="filteredBlockMeta.sections[s].fields[f].name | label"
                [hideIdFromUI]="true"
                [disabled]="disabled"
                [obligatory]="filteredBlockMeta.sections[s].fields[f].obligatory"
                [class.fieldHasError]="hasFieldAnError(errorPrefix + 'sections.' + s + '.' + f)"
                (select)="$event ? (filteredSections[s][f] = $event?.value) : null"
                (iconSelect)="openDescription(s, f, $event)"
              />
            }

            @if (filteredBlockMeta.sections[s].fields[f].type === 'ENUM' &&
                 filteredBlockMeta.sections[s].fields[f].allowMultipleSelection) {
              <ion-item [lines]="lines" [class.fieldHasError]="hasFieldAnError(errorPrefix + 'sections.' + s + '.' + f)">

                @if (!hideDescriptions && !disabled) {
                  <ion-button
                    fill="clear"
                    slot="start"
                    class="marginTop"
                    [disabled]="!hasFieldDescription(s, f)"
                    [color]="hasFieldDescription(s, f) ? 'primary' : 'medium'"
                    (click)="openDescription(s, f, $event)"
                  >
                    <ion-icon name="help-circle-outline" slot="icon-only" />
                  </ion-button>
                }

                <ion-select
                  multiple="true"
                  labelPlacement="stacked"
                  [placeholder]="'COMMON.TAP_TO_SELECT' | translate"
                  [disabled]="disabled"
                  [value]="getMultiSelectArray(s, f)"
                  (ionChange)="onMultiSelectChange(s, f, $event.detail.value)"
                >
                  <div slot="label">
                    {{ filteredBlockMeta.sections[s].fields[f].name | label }}
                    @if (filteredBlockMeta.sections[s].fields[f].obligatory && !disabled) {
                      <ion-text class="obligatoryDot" />
                    }
                  </div>
                  @for (option of filteredBlockMeta.sections[s].fields[f].enum; track option) {
                    <ion-select-option [value]="option">
                      {{ getMultiSelectOptionLabel(s, f, option) }}
                    </ion-select-option>
                  }
                </ion-select>
              </ion-item>
            }

            @if (
              filteredBlockMeta.sections[s].fields[f].type === 'STRING' ||
              filteredBlockMeta.sections[s].fields[f].type === 'NUMBER' ||
              filteredBlockMeta.sections[s].fields[f].type === 'TEXT'
            ) {
              <ion-item [lines]="lines" [class.fieldHasError]="hasFieldAnError(errorPrefix + 'sections.' + s + '.' + f)">
                <ion-label position="stacked" class="ion-text-wrap">
                  {{ filteredBlockMeta.sections[s].fields[f].name | label }}
                  @if (filteredBlockMeta.sections[s].fields[f].obligatory && !disabled) {
                    <ion-text class="obligatoryDot" />
                  }
                </ion-label>
                @if (!hideDescriptions && !disabled) {
                  <ion-button
                    fill="clear"
                    slot="start"
                    class="marginTop"
                    [disabled]="!hasFieldDescription(s, f)"
                    [color]="hasFieldDescription(s, f) ? 'primary' : 'medium'"
                    (click)="openDescription(s, f, $event)"
                  >
                    <ion-icon name="help-circle-outline" slot="icon-only" />
                  </ion-button>
                }
                @if (filteredBlockMeta.sections[s].fields[f].type === 'STRING') {
                  <ion-input type="text" [disabled]="disabled" [(ngModel)]="filteredSections[s][f]" />
                }
                @if (filteredBlockMeta.sections[s].fields[f].type === 'NUMBER') {
                  <ion-input
                    type="number"
                    [min]="filteredBlockMeta.sections[s].fields[f].min"
                    [max]="filteredBlockMeta.sections[s].fields[f].max"
                    [disabled]="disabled"
                    [(ngModel)]="filteredSections[s][f]"
                  />
                }
                @if (filteredBlockMeta.sections[s].fields[f].type === 'TEXT') {
                  <ion-textarea [rows]="3" [autoGrow]="true" [disabled]="disabled" [(ngModel)]="filteredSections[s][f]" />
                }
              </ion-item>
            }

            @if (filteredBlockMeta.sections[s].fields[f].type === 'DATE') {
              <ion-item [lines]="lines" [class.fieldHasError]="hasFieldAnError(errorPrefix + 'sections.' + s + '.' + f)">
                <ion-label position="stacked" class="ion-text-wrap">
                  {{ filteredBlockMeta.sections[s].fields[f].name | label }}
                  @if (filteredBlockMeta.sections[s].fields[f].obligatory && !disabled) {
                    <ion-text class="obligatoryDot" />
                  }
                </ion-label>
                @if (!hideDescriptions && !disabled) {
                  <ion-button
                    fill="clear"
                    slot="start"
                    class="marginTop"
                    [disabled]="!hasFieldDescription(s, f)"
                    [color]="hasFieldDescription(s, f) ? 'primary' : 'medium'"
                    (click)="openDescription(s, f, $event)"
                  >
                    <ion-icon name="help-circle-outline" slot="icon-only" />
                  </ion-button>
                }
                <idea-date-time
                  [disabled]="disabled"
                  [date]="filteredSections[s][f]"
                  (dateChange)="onDateFieldChange(s, f, $event)"
                ></idea-date-time>
              </ion-item>
            }

            @if (filteredBlockMeta.sections[s].fields[f].type === 'BOOLEAN') {
              <ion-item
                [lines]="lines"
                [button]="!disabled"
                [class.fieldHasError]="hasFieldAnError(errorPrefix + 'sections.' + s + '.' + f)"
              >
                @if (!hideDescriptions && !disabled) {
                  <ion-button
                    fill="clear"
                    slot="start"
                    [disabled]="!hasFieldDescription(s, f)"
                    [color]="hasFieldDescription(s, f) ? 'primary' : 'medium'"
                    (click)="openDescription(s, f, $event)"
                  >
                    <ion-icon name="help-circle-outline" slot="icon-only" />
                  </ion-button>
                }
                <ion-checkbox [disabled]="disabled" [(ngModel)]="filteredSections[s][f]">
                  <span class="ion-text-wrap">
                    {{ filteredBlockMeta.sections[s].fields[f].name | label }}
                    @if (filteredBlockMeta.sections[s].fields[f].obligatory && !disabled) {
                      <ion-text class="obligatoryDot" />
                    }
                  </span>
                </ion-checkbox>
              </ion-item>
            }
          </div>
        }
      </ion-list>
    }
  `,
  styles: [`
    ion-item .marginTop {
      margin-top: 16px;
    }

    .obligatoryDot::after {
      content: ' *';
      color: var(--ion-color-danger);
    }

    .aList.customBlockList {
      margin-bottom: 16px;
    }

    .fieldHasError {
      --border-color: var(--ion-color-danger);
    }

    .fieldHasError ion-label,
    .fieldHasError ion-input,
    .fieldHasError ion-select,
    .fieldHasError ion-textarea,
    .fieldHasError ion-checkbox {
      --color: var(--ion-color-danger);
    }

    .alertLongOptions {
      max-width: 90vw;
    }

    ion-list-header h2 {
      margin-bottom: 4px;
    }

    ion-list-header p {
      margin-top: 0;
      color: var(--ion-color-medium);
      font-size: 0.9em;
    }
  `]
})
export class WrapperCustomBlockComponent implements OnInit, DoCheck {
  @Input() sections: any;
  @Input() blockMeta: WrapperCustomBlockMeta;
  @Input() disabled = false;
  @Input() lines: string;
  @Input() hideDescriptions = false;
  @Input() errors = new Set();
  @Input() errorPrefix = '';

  @Output() sectionsChange = new EventEmitter<any>();

  filteredSections: any;
  filteredBlockMeta: any;

  private lastTrackedValues: { [key: string]: any } = {};
  private app = inject(AppService);
  private alertController = inject(AlertController);

  ngOnInit() {
    this.applyFilter();
    this.initializeMultiSelectValues();
  }

  ngDoCheck() {
    this.syncData();
    this.applyFilter();
  }

  private syncData() {
    if (!this.filteredSections) return;

    Object.keys(this.filteredSections).forEach(sectionKey => {
      if (!this.sections[sectionKey]) this.sections[sectionKey] = {};

      Object.keys(this.filteredSections[sectionKey]).forEach(fieldKey => {
        this.sections[sectionKey][fieldKey] = this.filteredSections[sectionKey][fieldKey];
      });
    });

    this.sectionsChange.emit({ ...this.sections });
  }

  private applyFilter() {
    if (!this.blockMeta || !this.blockMeta.sections || !this.blockMeta.sectionsLegend) {
      this.filteredBlockMeta = this.blockMeta;
      this.filteredSections = this.sections;
      return;
    }

    this.filteredSections = {};
    this.filteredBlockMeta = {
      ...this.blockMeta,
      sectionsLegend: [],
      sections: {}
    };

    this.blockMeta.sectionsLegend.forEach(sectionKey => {
      const originalSection = this.blockMeta.sections![sectionKey];

      if (!this.isSectionVisible(originalSection)) {
        return;
      }

      const visibleFields: string[] = [];
      const filteredSectionFields: { [key: string]: any } = {};
      const filteredSectionData: { [key: string]: any } = {};

      if (originalSection.fieldsLegend && originalSection.fields) {
        originalSection.fieldsLegend.forEach(fieldKey => {
          const field = originalSection.fields![fieldKey] as WrapperCustomFieldMeta;

          if (this.isFieldVisible(field)) {
            visibleFields.push(fieldKey);
            filteredSectionFields[fieldKey] = field;

            if (this.sections?.[sectionKey]?.[fieldKey] !== undefined) {
              filteredSectionData[fieldKey] = this.sections[sectionKey][fieldKey];
            }
          }
        });
      }

      if (visibleFields.length > 0) {
        this.filteredBlockMeta.sectionsLegend.push(sectionKey);
        this.filteredBlockMeta.sections[sectionKey] = {
          ...originalSection,
          fieldsLegend: visibleFields,
          fields: filteredSectionFields
        };
        this.filteredSections[sectionKey] = filteredSectionData;
      }
    });
  }

  private isSectionVisible(section: any): boolean {
    const visibilityOptions = section.visibilityOptions as VisibilityOptions;
    return this.checkVisibility(visibilityOptions);
  }

  private isFieldVisible(field: WrapperCustomFieldMeta): boolean {
    return this.checkVisibility(field.visibilityOptions);
  }

  private checkVisibility(options?: VisibilityOptions): boolean {
    if (!options) return true;

    if (options.visibleTo === 'externals' && !this.app.user.isExternal()) {
      return false;
    }
    if (options.visibleTo === 'esners' && this.app.user.isExternal()) {
      return false;
    }

    if (options.showIfField) {
      const [sectionKey, fieldKey] = options.showIfField.split('.');
      const currentValue = this.sections?.[sectionKey]?.[fieldKey];
      const expectedValue = options.showIfValue !== undefined ? options.showIfValue : true;

      if (currentValue !== expectedValue) {
        return false;
      }
    }

    return true;
  }

  private initializeMultiSelectValues() {
    if (!this.blockMeta || !this.blockMeta.sections || !this.blockMeta.sectionsLegend) {
      return;
    }

    this.blockMeta.sectionsLegend.forEach(sectionKey => {
      const section = this.blockMeta.sections![sectionKey];

      if (section.fieldsLegend && section.fields) {
        section.fieldsLegend.forEach(fieldKey => {
          const field = section.fields![fieldKey] as WrapperCustomFieldMeta;

          if (field.type === 'ENUM' && field.allowMultipleSelection) {
            if (!this.sections[sectionKey]) {
              this.sections[sectionKey] = {};
            }

            if (this.sections[sectionKey][fieldKey] === undefined) {
              this.sections[sectionKey][fieldKey] = '';
            }

            if (!this.sections[sectionKey][fieldKey] && field.default) {
              this.sections[sectionKey][fieldKey] = field.default;
            }
          }
        });
      }
    });
  }

  hasFieldAnError(field: string): boolean {
    return this.errors.has(field);
  }

  hasFieldDescription(sectionKey: string, fieldKey: string): boolean {
    return !!this.filteredBlockMeta?.sections[sectionKey]?.fields[fieldKey]?.description;
  }

  async openDescription(sectionKey: string, fieldKey: string, event: any): Promise<void> {
    if (event) event.stopPropagation();
    const field = this.filteredBlockMeta?.sections[sectionKey]?.fields[fieldKey];
    if (!field?.description) return;

    const message = typeof field.description === 'string' ? field.description : field.description.en;
    const header = typeof field.name === 'string' ? field.name : field.name.en;

    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'alertLongOptions'
    });
    await alert.present();
  }

  onDateFieldChange(sectionKey: string, fieldKey: string, date: any): void {
    if (!this.filteredSections[sectionKey]) {
      this.filteredSections[sectionKey] = {};
    }

    if (date) {
      this.filteredSections[sectionKey][fieldKey] = typeof date === 'number'
        ? new Date(date).toISOString()
        : new Date(date).toISOString();
    } else {
      this.filteredSections[sectionKey][fieldKey] = null;
    }
  }

  getMultiSelectArray(sectionKey: string, fieldKey: string): string[] {
    const value = this.filteredSections?.[sectionKey]?.[fieldKey];
    if (!value || typeof value !== 'string') {
      return [];
    }
    return value.split(', ').filter(v => v.trim());
  }

  onMultiSelectChange(sectionKey: string, fieldKey: string, selectedArray: string[]): void {
    if (!this.filteredSections[sectionKey]) {
      this.filteredSections[sectionKey] = {};
    }

    this.filteredSections[sectionKey][fieldKey] = selectedArray.length > 0 ? selectedArray.join(', ') : '';
  }

  getMultiSelectOptionLabel(sectionKey: string, fieldKey: string, option: string): string {
    const field = this.filteredBlockMeta?.sections[sectionKey]?.fields[fieldKey];
    return field?.enumLabels?.[option]?.en || option;
  }

  getEnumSuggestions(sectionKey: string, fieldKey: string): any[] {
    const field = this.filteredBlockMeta?.sections[sectionKey]?.fields[fieldKey];
    if (!field?.enum) return [];

    return field.enum.map(option => ({
      value: option,
      name: field.enumLabels?.[option]?.en || option
    }));
  }

  getEnumElementDescription(sectionKey: string, fieldKey: string): string {
    const field = this.filteredBlockMeta?.sections[sectionKey]?.fields[fieldKey];
    const currentValue = this.filteredSections?.[sectionKey]?.[fieldKey];

    if (!currentValue || !field?.enumLabels) return '';

    return field.enumLabels[currentValue]?.en || currentValue;
  }
}