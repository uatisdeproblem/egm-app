import { useState } from 'react';
import {
  IonLabel,
  IonIcon,
  IonItem,
  IonSkeletonText,
  IonButton,
  IonCard,
  IonCardHeader,
  IonAvatar,
  IonImg,
  IonCardContent
} from '@ionic/react';
import {
  call,
  chevronDown,
  chevronUp,
  logoFacebook,
  logoInstagram,
  logoLinkedin,
  logoTiktok,
  logoTwitter,
  mail
} from 'ionicons/icons';

import { UserProfile } from 'models/userProfile';

import { getImageURLByURI, usersFallbackImageURL } from '../utils/data';
import {
  getFacebookProfileURL,
  getInstagramProfileURL,
  getLinkedinProfileURL,
  getTikTokProfileURL,
  getTwitterProfileURL
} from '../utils';

interface ContainerProps {
  profile?: UserProfile;
}

const UserProfileCard: React.FC<ContainerProps> = ({ profile }) => {
  const [showDetails, setShowDetails] = useState<boolean>();

  return profile ? (
    <IonCard color="white" style={{ margin: 0 }}>
      <IonCardHeader style={{ padding: 6 }}>
        <IonItem lines="none" color="white" button onClick={() => setShowDetails(!showDetails)}>
          <IonAvatar slot="start">
            {profile.imageURI ? (
              <IonImg
                src={getImageURLByURI(profile.imageURI)}
                onIonError={(e: any) => (e.target.src = usersFallbackImageURL)}
              />
            ) : (
              <IonImg src={usersFallbackImageURL} />
            )}
          </IonAvatar>
          <IonLabel>
            {profile.getName()}
            <p title={profile.ESNSection}>
              {profile.ESNCountry} {profile.ESNSection ? `- ${profile.ESNSection}` : ''}
            </p>
          </IonLabel>

          <IonIcon icon={showDetails ? chevronDown : chevronUp} color="medium" slot="end" size="small"></IonIcon>
        </IonItem>
      </IonCardHeader>
      {showDetails ? (
        <IonCardContent className="ion-text-left">
          <p className="ion-text-right">
            {profile.contactPhone ? (
              <IonButton fill="clear" target="_blank" href={'tel:' + profile.contactPhone} title={profile.contactPhone}>
                <IonIcon icon={call} />
              </IonButton>
            ) : (
              ''
            )}
            {profile.contactEmail ? (
              <IonButton
                fill="clear"
                target="_blank"
                href={'mailto:' + profile.contactEmail}
                title={profile.contactEmail}
              >
                <IonIcon icon={mail} />
              </IonButton>
            ) : (
              ''
            )}
            {profile.facebook ? (
              <IonButton
                fill="clear"
                target="_blank"
                href={getFacebookProfileURL(profile.facebook)}
                title={profile.facebook}
              >
                <IonIcon icon={logoFacebook} />
              </IonButton>
            ) : (
              ''
            )}
            {profile.instagram ? (
              <IonButton
                fill="clear"
                target="_blank"
                href={getInstagramProfileURL(profile.instagram)}
                title={profile.instagram}
              >
                <IonIcon icon={logoInstagram} />
              </IonButton>
            ) : (
              ''
            )}
            {profile.twitter ? (
              <IonButton
                fill="clear"
                target="_blank"
                href={getTwitterProfileURL(profile.twitter)}
                title={profile.twitter}
              >
                <IonIcon icon={logoTwitter} />
              </IonButton>
            ) : (
              ''
            )}
            {profile.tiktok ? (
              <IonButton fill="clear" target="_blank" href={getTikTokProfileURL(profile.tiktok)} title={profile.tiktok}>
                <IonIcon icon={logoTiktok} />
              </IonButton>
            ) : (
              ''
            )}
            {profile.linkedin ? (
              <IonButton
                fill="clear"
                target="_blank"
                href={getLinkedinProfileURL(profile.linkedin)}
                title={profile.linkedin}
              >
                <IonIcon icon={logoLinkedin} />
              </IonButton>
            ) : (
              ''
            )}
          </p>
          {profile.languages.length ? (
            <IonItem color="white" lines="none" class="ion-text-right">
              <IonLabel class="ion-text-wrap">
                <i>Speaks:</i> {profile.languages.join(', ')}
              </IonLabel>
            </IonItem>
          ) : (
            ''
          )}
          {profile.bio ? <p className="ion-padding">{profile.bio}</p> : ''}
        </IonCardContent>
      ) : (
        ''
      )}
    </IonCard>
  ) : (
    <IonCard color="white">
      <IonCardHeader>
        <IonItem lines="none" color="white">
          <IonAvatar slot="start">
            <IonSkeletonText animated />
          </IonAvatar>
          <IonLabel>
            <IonSkeletonText animated style={{ width: '80%' }} />
            <p>
              <IonSkeletonText animated style={{ width: '60%' }} />
            </p>
          </IonLabel>
        </IonItem>
      </IonCardHeader>
    </IonCard>
  );
};

export default UserProfileCard;
