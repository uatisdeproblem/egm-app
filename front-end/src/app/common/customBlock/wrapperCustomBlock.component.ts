import { Component, Input, OnInit, inject, EventEmitter, Output, DoCheck } from '@angular/core';
import { AppService } from '@app/app.service';
import { WrapperCustomFieldMeta, WrapperCustomBlockMeta, VisibilityOptions } from '@models/wrappedCustomBlock.model';

@Component({
  selector: 'wrapper-custom-block',
  template: `
    <idea-custom-block
      [sections]="filteredSections"
      [blockMeta]="filteredBlockMeta"
      [disabled]="disabled"
      [lines]="lines"
      [hideDescriptions]="hideDescriptions"
      [errors]="errors"
      [errorPrefix]="errorPrefix"
    />
  `
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

  ngOnInit() {
    this.applyFilter();
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
}