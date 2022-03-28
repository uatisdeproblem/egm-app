import { useHistory } from 'react-router';
import {
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSkeletonText,
  IonRow,
  IonCol,
  IonAvatar,
  IonImg,
  IonCardSubtitle,
  IonButton,
  IonIcon
} from '@ionic/react';
import { eye, mail } from 'ionicons/icons';

import { Speaker } from 'models/speaker';

import { mdParser } from '../utils';
import { getImageURLByURI, usersFallbackImageURL } from '../utils/data';

interface ContainerProps {
  speaker?: Speaker;
  preview?: boolean;
  select?: () => void;
}

const SpeakerCard: React.FC<ContainerProps> = ({ speaker, preview, select }) => {
  const history = useHistory();

  return speaker ? (
    <IonCard button={!!select} onClick={select} color="white" style={{ height: preview ? '100%' : 'auto' }}>
      <IonCardHeader>
        <IonRow className="ion-align-items-center">
          <IonCol size="12" sizeSm={preview ? '12' : '3'}>
            <IonAvatar style={avatarStyle}>
              <IonImg
                src={getImageURLByURI(speaker.imageURI)}
                onIonError={(e: any) => (e.target.src = usersFallbackImageURL)}
              ></IonImg>
            </IonAvatar>
          </IonCol>
          <IonCol size="12" sizeSm={preview ? '12' : '9'}>
            <IonCardTitle style={preview ? { marginTop: 8 } : undefined}>
              <h2 style={{ marginTop: 3, marginBottom: 6 }} className={preview ? 'ion-text-center' : ''}>
                {speaker.name}
              </h2>
            </IonCardTitle>
            <IonCardSubtitle className={preview ? 'ion-text-center' : ''}>{speaker.organization.name}</IonCardSubtitle>
            <IonCardSubtitle className={preview ? 'ion-text-center' : ''} style={{ fontWeight: 300 }}>
              {speaker.title}
            </IonCardSubtitle>
          </IonCol>
        </IonRow>
      </IonCardHeader>
      {preview ? (
        ''
      ) : (
        <IonCardContent>
          <div className="ion-text-right" style={{ marginBottom: 10 }}>
            <IonButton
              fill="clear"
              color="dark"
              onClick={() => history.push('/organization/' + speaker.organization.organizationId)}
            >
              Discover organization <IonIcon icon={eye} slot="end"></IonIcon>
            </IonButton>
            {speaker.contactEmail ? (
              <IonButton target="_blank" href={`mailto:${speaker.contactEmail}?subject=EGM%20contact%20request`}>
                Contact me <IonIcon icon={mail} slot="end"></IonIcon>
              </IonButton>
            ) : (
              ''
            )}
          </div>

          <div className="divDescription">
            {speaker.description ? (
              <span dangerouslySetInnerHTML={{ __html: mdParser.render(speaker.description) }}></span>
            ) : (
              ''
            )}
          </div>
        </IonCardContent>
      )}
    </IonCard>
  ) : (
    <IonCard color="white">
      <IonCardHeader>
        <IonRow>
          <IonCol size="12" sizeSm={preview ? '12' : '3'}>
            <IonAvatar style={avatarStyle}>
              <IonSkeletonText animated />
            </IonAvatar>
          </IonCol>
          <IonCol size="12" sizeSm={preview ? '12' : '9'}>
            <IonCardSubtitle>
              <IonSkeletonText animated style={{ width: '40%' }} />
            </IonCardSubtitle>
            <IonCardTitle>
              <IonSkeletonText animated style={{ width: '60%' }} />
            </IonCardTitle>
          </IonCol>
        </IonRow>
        <IonCardTitle>
          <IonLabel></IonLabel>
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonSkeletonText animated style={{ width: '80%' }} />
        <IonSkeletonText animated style={{ width: '70%' }} />
        <IonSkeletonText animated style={{ width: '60%' }} />
      </IonCardContent>
    </IonCard>
  );
};

export default SpeakerCard;

const avatarStyle = { margin: '0 auto', width: 100, height: 100 };
