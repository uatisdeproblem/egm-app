import {
    IonAvatar,
    IonButton,
    IonButtons,
    IonCol,
    IonGrid,
    IonHeader,
    IonIcon,
    IonImg,
    IonItem,
    IonList,
    IonRow,
    IonSkeletonText,
    IonTitle,
    IonToolbar  } from '@ionic/react';

import { logoFacebook, logoInstagram, logoTwitter, logoTiktok, logoLinkedin } from "ionicons/icons";
import { usersFallbackImageURL } from '../utils/data';

import { UserProfile } from 'models/userProfile';

interface SocialCardProps {
  avatar: string;
  profile: UserProfile;
  toggleModal: Function;
}

var QRCode = require('qrcode.react');

const SocialCard: React.FC<SocialCardProps> = ({ avatar, profile, toggleModal }) => {

  return (
    <><IonHeader translucent>
          <IonToolbar>
              <IonTitle slot={'start'}>
                  Placeholder Title
              </IonTitle>
              <IonButtons slot={'end'}>
                  <IonButton onClick={() => toggleModal(false)}>
                      Close
                  </IonButton>
              </IonButtons>
          </IonToolbar>
      </IonHeader><IonList style={{ maxWidth: 450, margin: '0 auto' }}>
              <IonAvatar
                  style={{ margin: '0 auto', width: 100, height: 100, cursor: 'pointer' }}
              >
                  {avatar ? (
                      <IonImg src={avatar} onIonError={(e: any) => (e.target.src = usersFallbackImageURL)} />
                  ) : (
                      <IonSkeletonText animated></IonSkeletonText>
                  )}
              </IonAvatar>
              <IonItem color="white" style={{ marginTop: 10 }}>
                  {`${profile.firstName} ${profile.lastName}` || 'Name'}
              </IonItem>
              <IonItem color="white">
                  {`${profile.ESNCountry || 'ESN Country'}`}
              </IonItem>
              <IonItem color="white">
                  {`${profile.ESNSection || 'ESN Section'}`}
              </IonItem>
              <IonButtons>
                  <IonGrid>
                      <IonRow style={{ display: 'flex', textAlign: 'center' }}>
                          <IonCol>
                              <IonButton disabled={!profile.facebook}>
                                  <IonIcon icon={logoFacebook} />
                              </IonButton>
                          </IonCol>
                          <IonCol>
                              <IonButton disabled={!profile.instagram}>
                                  <IonIcon icon={logoInstagram} />
                              </IonButton>
                          </IonCol>
                          <IonCol>
                              <IonButton disabled={!profile.twitter}>
                                  <IonIcon icon={logoTwitter} />
                              </IonButton>
                          </IonCol>
                          <IonCol>
                              <IonButton disabled={!profile.tiktok}>
                                  <IonIcon icon={logoTiktok} />
                              </IonButton>
                          </IonCol>
                          <IonCol>
                              <IonButton disabled={!profile.linkedin}>
                                  <IonIcon icon={logoLinkedin} />
                              </IonButton>
                          </IonCol>
                      </IonRow>
                      <IonRow style={{ marginTop: 20, display: 'flex', textAlign: 'center' }}>
                          <IonCol>
                              <QRCode value="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
                          </IonCol>
                      </IonRow>
                  </IonGrid>
              </IonButtons>
          </IonList></>
  );
};

export default SocialCard;
