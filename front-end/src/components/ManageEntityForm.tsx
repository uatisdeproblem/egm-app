import { useEffect, useState } from 'react';
import {
  IonButton,
  useIonToast,
  IonLabel,
  IonItem,
  IonInput,
  useIonLoading,
  IonRow,
  IonCol,
  useIonAlert,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonText
} from '@ionic/react';
import { cloudUpload, open, trash } from 'ionicons/icons';

import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

import { Entity } from 'models/entity';
import { formatDateTime, mdParser, toastMessageDefaults } from '../utils';
import { openImage, uploadMediaAndGetURI } from '../utils/data';

export interface ManageEntityField {
  type: 'hidden' | 'text' | 'number' | 'url' | 'email' | 'datetime-local' | 'select' | 'image' | 'textarea';
  name: string;
  value: string | number | boolean;
  required?: boolean;
  label?: string;
  options?: { id: string | number; label: string }[];
}

interface ComponentProps {
  entityId?: string;
  initEntity: (entityData?: any) => Entity;
  loadEntity: (entityId: string) => Promise<Entity>;
  saveEntity: (entity: Entity) => Promise<Entity>;
  deleteEntity: (entity: Entity) => Promise<void>;
  entityFields: (entity: Entity, supportData: any) => ManageEntityField[];
  entitySupportData?: () => Promise<any>;
  onSave: () => void;
  onDelete: () => void;
}

const ManageEntityForm: React.FC<ComponentProps> = ({
  entityId,
  initEntity,
  loadEntity,
  saveEntity,
  deleteEntity,
  entityFields,
  entitySupportData,
  onSave,
  onDelete
}) => {
  const [showMessage] = useIonToast();
  const [showLoading, dismissLoading] = useIonLoading();
  const [showAlert] = useIonAlert();

  const mdPlugins = ['font-bold', 'font-italic', 'list-ordered', 'list-unordered', 'link', 'mode-toggle'];
  const mdDefaultConfig = { view: { html: false } };

  const [entity, setEntity] = useState<Entity>();
  const [supportData, setSupportData] = useState<any>();
  const [fields, setFields] = useState<any>();
  const [errors, setErrors] = useState(new Set<string>());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    let entity: any;
    if (entityId) {
      try {
        entity = await loadEntity(entityId);
      } catch (err) {
        await showMessage({ ...toastMessageDefaults, message: 'Entity not found.' });
        return;
      }
    } else entity = initEntity();

    const supportData = entitySupportData ? await entitySupportData() : {};

    setEntity(entity);
    setSupportData(supportData);
    setFields(entityFields(entity, supportData));
  };

  const fieldHasErrors = (fieldName: string): boolean => errors.has(fieldName);

  const acquireEntityDataFromForm = (): Entity => {
    const form = document.getElementById('entityForm') as HTMLFormElement;
    const formData = new FormData(form);
    const entity = initEntity(Object.fromEntries(formData.entries()));
    return entity;
  };

  const handleSubmit = async (event: any): Promise<void> => {
    event.preventDefault();

    const entity = acquireEntityDataFromForm();
    setEntity(entity);
    setFields(entityFields(entity, supportData));

    await showLoading();
    try {
      const errors = new Set(entity?.validate());
      setErrors(errors);
      if (errors.size !== 0) throw new Error('Invalid fields');

      await saveEntity(entity!);
      await showMessage({ ...toastMessageDefaults, message: 'Entity saved.', color: 'success' });
      onSave();
    } catch (err) {
      await showMessage({
        ...toastMessageDefaults,
        message: 'Please, check the form and try again.',
        color: 'warning'
      });
    } finally {
      await dismissLoading();
    }
  };

  const askAndDeleteEntity = async (): Promise<void> => {
    const header = 'Delete entity';
    const message = 'Are you sure? The operation is irreversible.';
    const handleDelete = async (): Promise<void> => {
      await showLoading();
      try {
        deleteEntity(entity!);
        await showMessage({ ...toastMessageDefaults, message: 'Entity removed.' });
        onDelete();
      } catch (err) {
        await showMessage({
          ...toastMessageDefaults,
          message: 'Operation failed; please try again.',
          color: 'warning'
        });
      } finally {
        await dismissLoading();
      }
    };
    const buttons = ['Cancel', { text: 'Delete', handler: handleDelete }];
    await showAlert({ header, message, buttons });
  };

  const uploadAndSetImageToField = async (event: any, fieldName: string): Promise<void> => {
    event.preventDefault();

    const file = event.target.files[0];

    try {
      await showLoading();
      const newImageURI = await uploadMediaAndGetURI(file);

      const entityData = acquireEntityDataFromForm() as any;
      entityData[fieldName] = newImageURI;

      setEntity(entityData);
      setFields(entityFields(entityData, supportData));
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Error uploading the image.', color: 'danger' });
    } finally {
      await dismissLoading();
    }
  };
  const removeImageFromField = (fieldName: string): void => {
    const entityData = entity as any;
    entityData[fieldName] = '';

    setEntity(entityData);
    setFields(entityFields(entityData, supportData));
  };

  return entity ? (
    <form id="entityForm" onSubmit={handleSubmit}>
      {fields?.map((f: any) => {
        if (f.type === 'hidden') return <input type="hidden" key={f.name} name={f.name} value={f.value || ''}></input>;
        else if (f.type === 'select')
          return (
            <IonItem color="white" key={f.name}>
              <IonLabel position="stacked">
                {f.label}
                {f.required ? <IonText color="danger">*</IonText> : ''}
              </IonLabel>
              <IonSelect
                interface="popover"
                value={f.value}
                name={f.name}
                className={fieldHasErrors(f.name) ? 'fieldHasError' : ''}
              >
                <IonSelectOption key="" value=""></IonSelectOption>
                {f.options.map((option: any) => (
                  <IonSelectOption key={option.id} value={option.id}>
                    {option.label}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          );
        else if (f.type === 'image')
          return (
            <IonItem color="white" key={f.name}>
              <IonLabel>
                {f.label} {f.required ? <IonText color="danger">*</IonText> : ''}
              </IonLabel>
              <input type="hidden" name={f.name} value={f.value || ''}></input>
              <input
                type="file"
                accept="image/*"
                onChange={e => uploadAndSetImageToField(e, f.name)}
                id={'img-input-' + f.name}
                hidden={true}
              />
              {f.value ? (
                <>
                  <IonButton slot="end" fill="clear" color="medium" onClick={() => removeImageFromField(f.name)}>
                    <IonIcon icon={trash} slot="icon-only"></IonIcon>
                  </IonButton>
                  <IonButton slot="end" fill="clear" color="medium" onClick={() => openImage(f.value)}>
                    <IonIcon icon={open} slot="icon-only"></IonIcon>
                  </IonButton>
                </>
              ) : (
                <IonButton
                  slot="end"
                  fill="clear"
                  color="medium"
                  onClick={() => document.getElementById('img-input-' + f.name)?.click()}
                >
                  <IonIcon icon={cloudUpload} slot="icon-only"></IonIcon>
                </IonButton>
              )}
            </IonItem>
          );
        else if (f.type === 'textarea')
          return (
            <div key={f.name} className={fieldHasErrors(f.name) ? 'fieldHasError' : ''}>
              <IonItem key={f.name} color="white" lines="none">
                <IonLabel position="stacked" style={{ marginBottom: 14 }}>
                  {f.label} {f.required ? <IonText color="danger">*</IonText> : ''}
                </IonLabel>
                <input type="hidden" name={f.name} id={'textarea-source-' + f.name} value={f.value || ''}></input>
              </IonItem>
              <MdEditor
                id={'textarea-editor-' + f.name}
                defaultValue={f.value}
                style={{ height: 300 }}
                plugins={mdPlugins}
                config={mdDefaultConfig}
                renderHTML={text => mdParser.render(text)}
                onChange={res => {
                  const source = document.getElementById('textarea-source-' + f.name) as HTMLInputElement;
                  if (source) source.value = res.text;
                }}
              />
            </div>
          );
        else if (f.type === 'datetime-local')
          return (
            <IonItem key={f.name} color="white">
              <IonLabel position="stacked">
                {f.label} {f.required ? <IonText color="danger">*</IonText> : ''}
              </IonLabel>
              <IonInput
                type={f.type}
                name={f.name}
                value={f.value ? formatDateTime(f.value) : ''}
                className={fieldHasErrors(f.name) ? 'fieldHasError' : ''}
              ></IonInput>
            </IonItem>
          );
        else
          return (
            <IonItem key={f.name} color="white">
              <IonLabel position="stacked">
                {f.label} {f.required ? <IonText color="danger">*</IonText> : ''}
              </IonLabel>
              <IonInput
                type={f.type}
                name={f.name}
                value={f.value || ''}
                className={fieldHasErrors(f.name) ? 'fieldHasError' : ''}
              ></IonInput>
            </IonItem>
          );
      })}
      <IonRow style={{ marginTop: 20 }}>
        <IonCol>
          <IonButton type="submit" expand="block">
            Save
          </IonButton>
        </IonCol>
        {entityId ? (
          <IonCol className="ion-text-right">
            <IonButton color="danger" onClick={askAndDeleteEntity}>
              Delete
            </IonButton>
          </IonCol>
        ) : (
          ''
        )}
      </IonRow>
    </form>
  ) : (
    <></>
  );
};

export default ManageEntityForm;
