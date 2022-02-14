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
  IonList
} from '@ionic/react';
import { close } from 'ionicons/icons';

import {
  deleteOrganization,
  deleteSession,
  deleteSpeaker,
  deleteVenue,
  getOrganization,
  getOrganizations,
  getSession,
  getSpeaker,
  getSpeakers,
  getVenue,
  getVenues,
  saveOrganization,
  saveSession,
  saveSpeaker,
  saveVenue
} from '../utils/data';
import { Entity } from 'models/entity';
import { Organization } from 'models/organization';
import { Speaker } from 'models/speaker';
import { Venue } from 'models/venue';
import { Session, SessionType } from 'models/session';

import ManageEntityForm, { ManageEntityField } from '../components/ManageEntityForm';
import { SessionTypeStr } from '../utils';

interface ManageEntityProps {
  initEntity: (entityData?: any) => Entity;
  loadEntity: (entityId: string) => Promise<Entity>;
  saveEntity: (entity: Entity) => Promise<Entity>;
  deleteEntity: (entity: Entity) => Promise<void>;
  entityFields: (entityFields: any, supportData?: any) => ManageEntityField[];
  entitySupportData?: () => Promise<any>;
}

const ManageEntityPage: React.FC = () => {
  const history = useHistory();

  const { type, id }: { type: string; id: string } = useParams();
  const entityId = id && id !== 'new' ? id : undefined;

  const manageEntity: { [entityType: string]: ManageEntityProps } = {
    organization: {
      initEntity: data => new Organization(data),
      loadEntity: async id => await getOrganization(id),
      saveEntity: async x => await saveOrganization(x as Organization),
      deleteEntity: async x => await deleteOrganization(x as Organization),
      entityFields: (x): ManageEntityField[] => [
        { type: 'hidden', name: 'organizationId', value: x['organizationId'] },
        { type: 'text', name: 'name', value: x['name'], label: 'Name', required: true },
        { type: 'text', name: 'description', value: x['description'], label: 'Description' },
        { type: 'url', name: 'website', value: x['website'], label: 'Website' },
        { type: 'email', name: 'contactEmail', value: x['contactEmail'], label: 'Contact email' },
        { type: 'image', name: 'imageURI', value: x['imageURI'], label: 'Logo' }
      ]
    },
    speaker: {
      initEntity: data => new Speaker(data),
      loadEntity: async id => await getSpeaker(id),
      saveEntity: async x => await saveSpeaker(x as Speaker),
      deleteEntity: async x => await deleteSpeaker(x as Speaker),
      entityFields: (x, supportData: { organizations: Organization[] }): ManageEntityField[] => {
        const organizations = supportData.organizations.map(o => ({ id: o.organizationId, label: o.name }));
        const required = true;
        return [
          { type: 'hidden', name: 'speakerId', value: x['speakerId'] },
          { type: 'text', name: 'name', value: x['name'], label: 'Name', required },
          {
            type: 'select',
            name: 'organization',
            value: x['organization'].organizationId,
            required,
            label: 'Organization',
            options: organizations
          },
          { type: 'text', name: 'title', value: x['title'], label: 'Title' },
          { type: 'text', name: 'description', value: x['description'], label: 'Description' },
          { type: 'email', name: 'contactEmail', value: x['contactEmail'], label: 'Contact email' },
          { type: 'image', name: 'imageURI', value: x['imageURI'], label: 'Picture' }
        ];
      },
      entitySupportData: async (): Promise<any> => ({ organizations: await getOrganizations() })
    },
    venue: {
      initEntity: data => new Venue(data),
      loadEntity: async id => await getVenue(id),
      saveEntity: async x => await saveVenue(x as Venue),
      deleteEntity: async x => await deleteVenue(x as Venue),
      entityFields: (x): ManageEntityField[] => [
        { type: 'hidden', name: 'venueId', value: x['venueId'] },
        { type: 'text', name: 'name', value: x['name'], label: 'Name', required: true },
        { type: 'text', name: 'address', value: x['address'], label: 'Address', required: true },
        { type: 'text', name: 'longitude', value: x['longitude'], label: 'Longitude', required: true },
        { type: 'text', name: 'latitude', value: x['latitude'], label: 'Latitude', required: true },
        { type: 'text', name: 'description', value: x['description'], label: 'Description' },
        { type: 'image', name: 'imageURI', value: x['imageURI'], label: 'Image' },
        { type: 'image', name: 'planImageURI', value: x['planImageURI'], label: 'Plan (internal building)' }
      ]
    },
    session: {
      initEntity: data => new Session(data),
      loadEntity: async id => await getSession(id),
      saveEntity: async x => await saveSession(x as Session),
      deleteEntity: async x => await deleteSession(x as Session),
      entityFields: (x, supportData: { venues: Venue[]; speakers: Speaker[] }): ManageEntityField[] => {
        const sessionTypes = Object.keys(SessionType).map(t => ({ id: t, label: (SessionTypeStr as any)[t] }));
        const venues = supportData.venues.map(v => ({ id: v.venueId, label: v.name }));
        const speakers = supportData.speakers.map(s => ({
          id: s.speakerId,
          label: s.name.concat(' ', Speaker.getRole(s))
        }));
        const required = true;
        return [
          { type: 'hidden', name: 'sessionId', value: x['sessionId'] },
          { type: 'text', name: 'name', value: x['name'], label: 'Name', required },
          { type: 'text', name: 'description', value: x['description'], label: 'Description' },
          { type: 'select', name: 'type', value: x['type'], required, label: 'Type', options: sessionTypes },
          { type: 'datetime-local', name: 'startsAt', value: x['startsAt'], label: 'Starts at' },
          { type: 'datetime-local', name: 'endsAt', value: x['endsAt'], label: 'Ends at' },
          { type: 'select', name: 'venue', value: x['venue'].venueId, required, label: 'Venue', options: venues },
          {
            type: 'select',
            name: 'speaker1',
            value: x['speaker1'].speakerId,
            required,
            label: 'Speaker 1',
            options: speakers
          },
          { type: 'select', name: 'speaker2', value: x['speaker2'].speakerId, label: 'Speaker 2', options: speakers },
          { type: 'select', name: 'speaker3', value: x['speaker3'].speakerId, label: 'Speaker 3', options: speakers }
        ];
      },
      entitySupportData: async (): Promise<any> => ({ speakers: await getSpeakers(), venues: await getVenues() })
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
        <IonList style={{ maxWidth: 500, margin: '0 auto' }}>
          <ManageEntityForm
            entityId={entityId}
            initEntity={manageEntity[type].initEntity}
            loadEntity={manageEntity[type].loadEntity}
            saveEntity={manageEntity[type].saveEntity}
            deleteEntity={manageEntity[type].deleteEntity}
            entityFields={manageEntity[type].entityFields}
            entitySupportData={manageEntity[type].entitySupportData}
            onSave={() => history.goBack()}
            onDelete={() => history.push('/menu')}
          ></ManageEntityForm>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ManageEntityPage;
