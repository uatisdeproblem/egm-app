/**
 * Wrapper models for custom fields, that extend the model used in iter-idea package
 * Required to make possible to filter visualization of form items based on user type/selection.
 */
import { CustomFieldMeta, CustomSectionMeta, CustomBlockMeta, Label, Languages, CustomFieldTypes } from 'idea-toolbox';

export interface VisibilityOptions {
  visibleTo: 'both' | 'esners' | 'externals';
  showIfField?: string;
  showIfValue?: boolean;
}

export class WrapperCustomFieldMeta extends CustomFieldMeta {
  visibilityOptions?: VisibilityOptions;
  key?: string;
  allowMultipleSelection?: boolean;

  load(x: any, languages: Languages): void {
    super.load(x, languages);

    this.allowMultipleSelection = x.allowMultipleSelection || false;

    if (x && x.visibilityOptions) {
      this.visibilityOptions = {
        visibleTo: x.visibilityOptions.visibleTo || 'both',
        showIfField: x.visibilityOptions.showIfField,
        showIfValue: x.visibilityOptions.showIfValue
      };
    }
  }

  validate(languages: Languages): string[] {
    return super.validate(languages);
  }

  validateField(field: any): boolean {
    if (this.type === CustomFieldTypes.ENUM) {
      if (field && typeof field === 'string') {
        if (this.allowMultipleSelection) {
          const values = field.includes(', ') ? field.split(', ') : [field];
          for (const value of values) {
            if (!this.enum.some(x => x === value.trim())) {
              return false;
            }
          }
          return true;
        } else {
          return this.enum.some(x => x === field);
        }
      }
    }

    return super.validateField(field);
  }
}

export class WrapperCustomSectionMeta extends CustomSectionMeta {
  fields: { [key: string]: WrapperCustomFieldMeta };

  load(x: any, languages: Languages): void {
    super.load(x, languages);
    if (x && x.fields) {
      this.fields = {};
      Object.keys(x.fields).forEach(key => {
        this.fields[key] = new WrapperCustomFieldMeta(x.fields[key], languages);
      });
    }
  }
}

export class WrapperCustomBlockMeta extends CustomBlockMeta {
  sections: { [key: string]: WrapperCustomSectionMeta };

  load(x: any, languages: Languages): void {
    super.load(x, languages);
    if (x && x.sections) {
      this.sections = {};
      Object.keys(x.sections).forEach(key => {
        this.sections[key] = new WrapperCustomSectionMeta(x.sections[key], languages);
      });
    }
  }

  validateSections(sections: any, user?: { isExternal(): boolean }): string[] {
    sections = sections || {};
    const errors = new Array<string>();

    this.sectionsLegend.forEach(sectionKey => {
      const section = this.sections[sectionKey];
      const sectionData = sections[sectionKey];

      if (!sectionData) {
        return;
      }

      const filteredSection = this.createFilteredSection(section, sectionData, sections, user);

      const sectionErrors = filteredSection.validateFields(sectionData);
      sectionErrors.forEach(error => errors.push(`${sectionKey}.${error}`));
    });

    return errors;
  }


  private createFilteredSection(originalSection: WrapperCustomSectionMeta, sectionData: any, allData: any, user?: { isExternal(): boolean }): WrapperCustomSectionMeta {
    const filteredSection = new WrapperCustomSectionMeta();

    filteredSection.name = originalSection.name;
    filteredSection.description = originalSection.description;
    filteredSection.fieldsLegend = [];
    filteredSection.fields = {};

    if (!originalSection.fields || !originalSection.fieldsLegend) {
      return filteredSection;
    }


    originalSection.fieldsLegend.forEach(fieldKey => {
      const field = originalSection.fields![fieldKey];
      const fieldIsInData = sectionData.hasOwnProperty.call(fieldKey);
      const fieldShouldBeVisible = this.shouldFieldBeVisible(field, allData, user);


      if (fieldIsInData || (fieldShouldBeVisible && field.obligatory)) {
        filteredSection.fieldsLegend.push(fieldKey);
        filteredSection.fields[fieldKey] = field;
      }
    });

    return filteredSection;
  }

  private shouldFieldBeVisible(field: WrapperCustomFieldMeta, allData: any, user?: { isExternal(): boolean }): boolean {
    if (!field.visibilityOptions) {
      return true;
    }

    if (user) {
      const isExternal = user.isExternal();
      if (field.visibilityOptions.visibleTo === 'esners' && isExternal) return false;
      if (field.visibilityOptions.visibleTo === 'externals' && !isExternal) return false;
    }

    if (field.visibilityOptions.showIfField && field.visibilityOptions.showIfValue !== undefined) {
      const dependentValue = this.getFieldValueFromData(allData, field.visibilityOptions.showIfField);
      if (dependentValue !== field.visibilityOptions.showIfValue) {
        return false;
      }
    }

    return true;
  }

  private getFieldValueFromData(data: any, fieldPath: string): any {
    const pathParts = fieldPath.split('.');
    let value = data;

    for (const part of pathParts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }
}