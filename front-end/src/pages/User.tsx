import { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonSegment, IonSegmentButton, IonToolbar } from '@ionic/react';

import UserProfileComponent from './UserProfile';
import UserConnectionsComponent from './UserConnections';

const UserPage: React.FC = () => {
  const [segment, setSegment] = useState('friends');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="ideaToolbar" style={{ '--min-height': 'auto' }}>
          <IonSegment value={segment}>
            <IonSegmentButton value="friends" style={{ maxWidth: 150 }} onClick={() => setSegment('friends')}>
              Friends
            </IonSegmentButton>
            <IonSegmentButton value="profile" style={{ maxWidth: 150 }} onClick={() => setSegment('profile')}>
              Profile
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {segment === 'friends' ? <UserConnectionsComponent></UserConnectionsComponent> : ''}
        {segment === 'profile' ? <UserProfileComponent></UserProfileComponent> : ''}
      </IonContent>
    </IonPage>
  );
};

export default UserPage;
