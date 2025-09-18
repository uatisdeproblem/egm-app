/**
 * Wrapper models for custom fields, that extend the model used in iter-idea package
 * Required to make possible to filter visualization of form items based on user type/selection.
 */
import { CustomFieldMeta, CustomSectionMeta, CustomBlockMeta, Label, Languages } from 'idea-toolbox';

export interface VisibilityOptions {
  visibleTo: 'both' | 'esners' | 'externals';
  showIfField?: string;
  showIfValue?: boolean;
}

export class WrapperCustomFieldMeta extends CustomFieldMeta {
  visibilityOptions?: VisibilityOptions;
  key?: string;

  load(x: any, languages: Languages): void {
    super.load(x, languages);

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
}