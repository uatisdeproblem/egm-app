import { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonToolbar
} from '@ionic/react';

import { UserProfile } from 'models/userProfile';

import { getUserProfile } from '../utils/data';

import UserProfileComponent from '../components/UserProfile';
import UserConnectionsComponent from '../components/UserConnections';

const UserPage: React.FC = () => {
  const [segment, setSegment] = useState('connections');

  const [userProfile, setUserProfile] = useState<UserProfile>();

  useEffect(() => {
    const loadData = async () => {
      const userProfile = await getUserProfile();
      setUserProfile(userProfile);
    };
    loadData();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="ideaToolbar" style={{ '--min-height': 'auto' }}>
          <IonSegment value={segment}>
            <IonSegmentButton value="connections" style={{ maxWidth: 150 }} onClick={() => setSegment('connections')}>
              Connections
            </IonSegmentButton>
            <IonSegmentButton value="profile" style={{ maxWidth: 150 }} onClick={() => setSegment('profile')}>
              Profile
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      {userProfile ? (
        <IonContent>
          {segment === 'connections' ? (
            userProfile.getName() ? (
              <UserConnectionsComponent profile={userProfile}></UserConnectionsComponent>
            ) : (
              <IonList>
                <IonItem button onClick={() => setSegment('profile')}>
                  <IonLabel className="ion-text-wrap ion-text-center">
                    <i>Complete your profile by adding at least your name to start adding new connections.</i>
                  </IonLabel>
                </IonItem>
              </IonList>
            )
          ) : (
            ''
          )}
          {segment === 'profile' ? <UserProfileComponent profile={userProfile}></UserProfileComponent> : ''}
        </IonContent>
      ) : (
        ''
      )}
    </IonPage>
  );
};

export default UserPage;
