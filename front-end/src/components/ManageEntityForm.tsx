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
  IonSelectOption
} from '@ionic/react';

import { toastMessageDefaults } from '../utils';

import { Entity } from 'models/entity';

export interface ManageEntityField {
  type: 'hidden' | 'text' | 'number' | 'url' | 'email' | 'datetime-local' | 'select' | 'select-multiple';
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

  const handleSubmit = async (event: any): Promise<void> => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const entity = initEntity(Object.fromEntries(formData.entries()));

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

  return entity ? (
    <form onSubmit={handleSubmit}>
      {fields?.map((f: any) => {
        if (f.type === 'hidden') return <input type="hidden" key={f.name} name={f.name} value={f.value || ''}></input>;
        else if (f.type === 'select')
          return (
            <IonItem color="white" key={f.name}>
              <IonLabel position="stacked">{f.label}</IonLabel>
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
        else
          return (
            <IonItem key={f.name}>
              <IonLabel position="stacked">{f.label}</IonLabel>
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
