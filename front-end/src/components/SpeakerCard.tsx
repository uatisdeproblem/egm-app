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
  IonCardSubtitle
} from '@ionic/react';

import { Speaker } from 'models/speaker';

interface ContainerProps {
  speaker?: Speaker;
  preview?: boolean;
  select?: () => void;
}

const fallbackSpeakerImg = '/assets/images/no-avatar.jpg';

const SpeakerCard: React.FC<ContainerProps> = ({ speaker, preview, select }) => {
  return speaker ? (
    <IonCard
      button={!!select}
      onClick={select}
      color="white"
      style={{
        boxShadow: '0 0 5px 3px rgba(0, 0, 0, 0.05)',
        margin: '0',
        width: '100%',
        height: preview ? '100%' : 'auto'
      }}
    >
      <IonCardHeader>
        <IonRow className="ion-align-items-center">
          <IonCol size={preview ? '12' : '3'}>
            <IonAvatar style={{ margin: '0 auto', width: 100, height: 100, marginBottom: 16 }}>
              <IonImg src={fallbackSpeakerImg} onIonError={(e: any) => (e.target.src = fallbackSpeakerImg)}></IonImg>
            </IonAvatar>
          </IonCol>
          <IonCol size={preview ? '12' : '9'}>
            {Speaker.getRole(speaker).length ? (
              <IonCardSubtitle className={preview ? 'ion-text-center' : ''}>{Speaker.getRole(speaker)}</IonCardSubtitle>
            ) : (
              ''
            )}
            <IonCardTitle>
              <h2 style={{ marginTop: 3 }} className={preview ? 'ion-text-center' : ''}>
                {speaker.name}
              </h2>
            </IonCardTitle>
          </IonCol>
        </IonRow>
      </IonCardHeader>
      <IonCardContent>{preview ? '' : speaker.description}</IonCardContent>
    </IonCard>
  ) : (
    <IonCard onClick={select}>
      <IonCardHeader>
        <IonRow>
          <IonCol>
            <IonAvatar>
              <IonSkeletonText animated />
            </IonAvatar>
          </IonCol>
          <IonCol>
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
