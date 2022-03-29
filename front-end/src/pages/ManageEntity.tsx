import { useHistory } from 'react-router';
import { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButtons,
  IonButton,
  IonList,
  useIonViewWillEnter,
  useIonViewWillLeave
} from '@ionic/react';
import { close } from 'ionicons/icons';

import {
  deleteCommunication,
  deleteOrganization,
  deleteRoom,
  deleteSession,
  deleteSpeaker,
  deleteVenue,
  getCommunication,
  getOrganization,
  getOrganizations,
  getRoom,
  getRooms,
  getSession,
  getSpeaker,
  getSpeakers,
  getVenue,
  getVenues,
  saveCommunication,
  saveOrganization,
  saveRoom,
  saveSession,
  saveSpeaker,
  saveVenue
} from '../utils/data';
import { Entity } from 'models/entity';
import { Organization } from 'models/organization';
import { Speaker } from 'models/speaker';
import { Venue } from 'models/venue';
import { Room } from 'models/room';
import { Session, SessionType } from 'models/session';
import { Communication } from 'models/communication';

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

  const [type, setType] = useState<string>();
  const [entityId, setEntityId] = useState<string>();

  useIonViewWillEnter(() => {
    const pathParams = document.location.pathname.split('/').slice(-2);
    setEntityId(pathParams[1] && pathParams[1] !== 'new' ? pathParams[1] : '');
    setType(pathParams[0]);
  }, []);
  useIonViewWillLeave(() => {
    setEntityId('');
    setType('');
  }, []);

  const manageEntity: { [entityType: string]: ManageEntityProps } = {
    organization: {
      initEntity: data => new Organization(data),
      loadEntity: async id => await getOrganization(id),
      saveEntity: async x => await saveOrganization(x as Organization),
      deleteEntity: async x => await deleteOrganization(x as Organization),
      entityFields: (x): ManageEntityField[] => [
        { type: 'hidden', name: 'organizationId', value: x['organizationId'] },
        { type: 'text', name: 'name', value: x['name'], label: 'Name', required: true },
        { type: 'textarea', name: 'description', value: x['description'], label: 'Description' },
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
          { type: 'textarea', name: 'description', value: x['description'], label: 'Description' },
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
        { type: 'textarea', name: 'description', value: x['description'], label: 'Description' },
        { type: 'image', name: 'imageURI', value: x['imageURI'], label: 'Image' }
      ]
    },
    room: {
      initEntity: data => new Room(data),
      loadEntity: async id => await getRoom(id),
      saveEntity: async x => await saveRoom(x as Room),
      deleteEntity: async x => await deleteRoom(x as Room),
      entityFields: (x, supportData: { venues: Venue[] }): ManageEntityField[] => {
        const venues = supportData.venues.map(v => ({ id: v.venueId, label: v.name }));
        const required = true;
        return [
          { type: 'hidden', name: 'roomId', value: x['roomId'] },
          { type: 'text', name: 'name', value: x['name'], label: 'Name', required },
          { type: 'select', name: 'venue', value: x['venue'].venueId, required, label: 'Venue', options: venues },
          { type: 'text', name: 'internalLocation', value: x['internalLocation'], label: 'Internal location' },
          { type: 'textarea', name: 'description', value: x['description'], label: 'Description' },
          { type: 'image', name: 'imageURI', value: x['imageURI'], label: 'Picture' },
          { type: 'image', name: 'planImageURI', value: x['planImageURI'], label: 'Plan (internal)' }
        ];
      },
      entitySupportData: async (): Promise<any> => ({ venues: await getVenues() })
    },
    session: {
      initEntity: data => new Session(data),
      loadEntity: async id => await getSession(id),
      saveEntity: async x => await saveSession(x as Session),
      deleteEntity: async x => await deleteSession(x as Session),
      entityFields: (x, supportData: { rooms: Room[]; speakers: Speaker[] }): ManageEntityField[] => {
        const sessionTypes = Object.keys(SessionType).map(t => ({ id: t, label: (SessionTypeStr as any)[t] }));
        const rooms = supportData.rooms.map(r => ({ id: r.roomId, label: r.name.concat(` (${r.venue.name})`) }));
        const speakers = supportData.speakers.map(s => ({
          id: s.speakerId,
          label: s.name.concat(` (${s.organization.name})`)
        }));
        const required = true;
        return [
          { type: 'hidden', name: 'sessionId', value: x['sessionId'] },
          { type: 'text', name: 'code', value: x['code'], label: 'Code' },
          { type: 'text', name: 'name', value: x['name'], label: 'Name', required },
          { type: 'textarea', name: 'description', value: x['description'], label: 'Description' },
          { type: 'select', name: 'type', value: x['type'], required, label: 'Type', options: sessionTypes },
          { type: 'datetime-local', name: 'startsAt', value: x['startsAt'], label: 'Starts at' },
          { type: 'number', name: 'durationMinutes', value: x['durationMinutes'], label: 'Duration (minutes)' },
          { type: 'select', name: 'room', value: x['room'].roomId, required, label: 'Room', options: rooms },
          {
            type: 'select',
            name: 'speaker1',
            value: x['speaker1'].speakerId,
            required,
            label: 'Speaker 1',
            options: speakers
          },
          { type: 'select', name: 'speaker2', value: x['speaker2'].speakerId, label: 'Speaker 2', options: speakers },
          { type: 'select', name: 'speaker3', value: x['speaker3'].speakerId, label: 'Speaker 3', options: speakers },
          { type: 'select', name: 'speaker4', value: x['speaker4'].speakerId, label: 'Speaker 4', options: speakers },
          { type: 'select', name: 'speaker5', value: x['speaker5'].speakerId, label: 'Speaker 5', options: speakers }
        ];
      },
      entitySupportData: async (): Promise<any> => ({ speakers: await getSpeakers(), rooms: await getRooms() })
    },
    communication: {
      initEntity: data => new Communication(data),
      loadEntity: async id => await getCommunication(id),
      saveEntity: async x => await saveCommunication(x as Communication),
      deleteEntity: async x => await deleteCommunication(x as Communication),
      entityFields: (x): ManageEntityField[] => {
        const required = true;
        return [
          { type: 'hidden', name: 'communicationId', value: x['communicationId'] },
          { type: 'text', name: 'title', value: x['title'], label: 'Title', required },
          { type: 'textarea', name: 'content', value: x['content'], label: 'Content', required },
          { type: 'datetime-local', name: 'publishedAt', value: x['publishedAt'], label: 'Published at', required },
          { type: 'image', name: 'imageURI', value: x['imageURI'], label: 'Image' }
        ];
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="ideaToolbar">
          <IonTitle>
            {entityId ? 'Manage' : 'New'} {type}
          </IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={close} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList style={{ maxWidth: 500, margin: '0 auto' }}>
          {type ? (
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
          ) : (
            ''
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ManageEntityPage;
