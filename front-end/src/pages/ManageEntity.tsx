import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButtons,
  IonButton,
  useIonToast,
  IonList,
  IonLabel,
  IonItem,
  IonInput,
  useIonLoading,
  IonRow,
  IonCol,
  useIonAlert
} from '@ionic/react';
import { close } from 'ionicons/icons';

import { Venue } from 'models/venue';
import { toastMessageDefaults } from '../utils';
import { deleteVenue, getVenue, saveVenue } from '../utils/data';
import { Speaker } from 'models/speaker';
import { Organization } from 'models/organization';
import { Session } from 'models/session';

type Entity = Venue | Speaker | Organization | Session;

const ManageEntityPage: React.FC = () => {
  const history = useHistory();
  const [showMessage] = useIonToast();
  const [showLoading, dismissLoading] = useIonLoading();
  const [showAlert] = useIonAlert();

  const { type, id }: { type: string; id: string } = useParams();

  const [entity, setEntity] = useState<Entity>();
  const [fields, setFields] = useState<any>();
  const [errors, setErrors] = useState(new Set<string>());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    let entity: any;
    if (id && id !== 'new') {
      try {
        entity = await loadEntity(type, id);
      } catch (err) {
        await showMessage({ ...toastMessageDefaults, message: 'Entity not found.' });
        return;
      }
    } else entity = initEntity(type);

    setEntity(entity);
    setFields(getEntityFields(type, entity));
  };

  const initEntity = (type: string, data: any = {}): Venue => {
    switch (type) {
      case 'venue':
        return new Venue(data);
      default:
        throw new Error('Unknown entity');
    }
  };
  const loadEntity = async (type: string, id: string): Promise<Venue> => {
    switch (type) {
      case 'venue':
        return await getVenue(id);
      default:
        throw new Error('Unknown entity');
    }
  };
  const getEntityFields = (type: string, entity: Entity): any[] => {
    switch (type) {
      case 'venue':
        return [
          { type: 'hidden', name: 'venueId', value: getFieldValue(entity, 'venueId') },
          { type: 'text', name: 'name', value: getFieldValue(entity, 'name'), label: 'Name' },
          { type: 'text', name: 'address', value: getFieldValue(entity, 'address'), label: 'Address' },
          { type: 'text', name: 'description', value: getFieldValue(entity, 'description'), label: 'Description' },
          { type: 'text', name: 'longitude', value: getFieldValue(entity, 'longitude'), label: 'Longitude' },
          { type: 'text', name: 'latitude', value: getFieldValue(entity, 'latitude'), label: 'Latitude' }
        ];
      default:
        throw new Error('Unknown entity');
    }
  };
  const getFieldValue = (entity: Entity, fieldName: string): any => (entity as any)[fieldName];
  const saveEntity = async (type: string, entity: Entity): Promise<Entity> => {
    switch (type) {
      case 'venue':
        return await saveVenue(entity as Venue);
      default:
        throw new Error('Unknown entity');
    }
  };

  const deleteEntity = async (type: string, entity: Entity): Promise<void> => {
    switch (type) {
      case 'venue':
        return await deleteVenue(entity as Venue);
      default:
        throw new Error('Unknown entity');
    }
  };
  const askAndDeleteEntity = async (): Promise<void> => {
    const header = 'Delete entity';
    const message = 'Are you sure? The operation is irreversible.';
    const handleDelete = async (): Promise<void> => {
      await showLoading();
      try {
        deleteEntity(type, entity!);
        await showMessage({ ...toastMessageDefaults, message: 'Entity removed.' });
        history.push('/menu');
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

  const fieldHasErrors = (fieldName: string): boolean => errors.has(fieldName);

  const handleSubmit = async (event: any): Promise<void> => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const entity = initEntity(type, Object.fromEntries(formData.entries()));

    setEntity(entity);
    setFields(getEntityFields(type, entity));

    await showLoading();
    try {
      const errors = new Set(entity?.validate());
      setErrors(errors);
      if (errors.size !== 0) throw new Error('Invalid fields');

      await saveEntity(type, entity!);
      await showMessage({ ...toastMessageDefaults, message: 'Entity saved.', color: 'success' });
      history.goBack();
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="ideaToolbar">
          <IonTitle className="ion-text-left">
            {id && id !== 'new' ? 'Manage' : 'New'} {type}
          </IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={close} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {entity ? (
          <IonList style={{ maxWidth: 500, margin: '0 auto' }}>
            <form onSubmit={handleSubmit}>
              {fields?.map((f: any) => {
                if (f.type === 'hidden') return <input type="hidden" name={f.name} value={f.value}></input>;
                else
                  return (
                    <IonItem key={f.name}>
                      <IonLabel position="stacked">{f.label}</IonLabel>
                      <IonInput
                        type={f.type}
                        name={f.name}
                        value={f.value}
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
                {id && id !== 'new' ? (
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
          </IonList>
        ) : (
          ''
        )}
      </IonContent>
    </IonPage>
  );
};

export default ManageEntityPage;
