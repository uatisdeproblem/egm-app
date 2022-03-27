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
  IonCardContent,
  useIonPopover,
  useIonAlert,
  useIonToast,
  useIonLoading
} from '@ionic/react';
import { call, logoFacebook, logoInstagram, logoLinkedin, logoTiktok, logoTwitter, mail, trash } from 'ionicons/icons';

import { UserProfile } from 'models/userProfile';

import { getImageURLByURI, usersFallbackImageURL, deleteConnection } from '../utils/data';
import {
  getFacebookProfileURL,
  getInstagramProfileURL,
  getLinkedinProfileURL,
  getTikTokProfileURL,
  getTwitterProfileURL,
  toastMessageDefaults
} from '../utils';

interface ContainerProps {
  profile?: UserProfile;
  showDetails?: boolean;
  isUserProfile?: boolean;
  onDeletedConnection?: () => void;
  onHide?: () => void;
}

const UserProfileCard: React.FC<ContainerProps> = ({
  profile,
  showDetails,
  isUserProfile,
  onDeletedConnection,
  onHide
}) => {
  const [showAlert] = useIonAlert();
  const [showMessage] = useIonToast();
  const [showLoading, dismissLoading] = useIonLoading();

  const [showPopover, dismissPopover] = useIonPopover(UserProfileCard, {
    profile,
    showDetails: true,
    onDeletedConnection,
    onHide: () => dismissPopover()
  });

  const openCardWithDetails = (event: any) => {
    if (showDetails) return;

    showPopover({ event, cssClass: 'widePopover' });
  };

  const askConfirmationToDeleteConnection = async (): Promise<void> => {
    const header = 'Delete connection';
    const message = 'Are you sure?';
    const buttons = [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Delete', handler: () => deleteConnectionWithUser(profile!.userId) }
    ];
    await showAlert({ header, message, buttons });
  };

  const deleteConnectionWithUser = async (userId: string): Promise<void> => {
    await showLoading();
    try {
      await deleteConnection(userId);

      await showMessage({ ...toastMessageDefaults, message: 'Connection removed.', color: 'success' });

      if (onDeletedConnection) onDeletedConnection();
      if (onHide) onHide();
    } catch (e) {
      await showMessage({ ...toastMessageDefaults, message: 'Error finding the user.', color: 'danger' });
    } finally {
      await dismissLoading();
    }
  };

  return profile ? (
    <IonCard color="white" style={{ margin: 0 }}>
      <IonCardHeader style={{ padding: 6 }}>
        <IonItem lines="none" color="white" button={!showDetails} onClick={openCardWithDetails}>
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
            <p className={showDetails ? 'ion-text-wrap' : ''}>
              {profile.ESNCountry || '-'} {profile.ESNSection ? `- ${profile.ESNSection}` : ''}
            </p>
          </IonLabel>
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
          {profile.bio ? (
            <p className="ion-padding" style={{ background: 'var(--ion-color-light)' }}>
              {profile.bio}
            </p>
          ) : (
            ''
          )}
          {isUserProfile ? (
            ''
          ) : (
            <p className="ion-padding ion-text-center" style={{ marginTop: 10 }}>
              <IonButton size="small" color="danger" fill="clear" onClick={askConfirmationToDeleteConnection}>
                Delete connection <IonIcon icon={trash} slot="end"></IonIcon>
              </IonButton>
            </p>
          )}
        </IonCardContent>
      ) : (
        ''
      )}
    </IonCard>
  ) : (
    <IonCard color="white" style={{ margin: 0 }}>
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
