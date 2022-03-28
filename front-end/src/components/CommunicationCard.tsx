import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSkeletonText,
  IonRow,
  IonCol,
  IonImg,
  IonCardSubtitle,
  IonButton,
  IonIcon
} from '@ionic/react';
import { mailOpenOutline, mailUnreadOutline } from 'ionicons/icons';

import { CommunicationWithMarker } from 'models/communication';

import { formatDateShort, formatTime, mdParser } from '../utils';
import { getImageURLByURI, newsFallbackImageURL } from '../utils/data';

interface ContainerProps {
  communication?: CommunicationWithMarker;
  preview?: boolean;
  select?: () => void;
  toggleMarkAsRead?: () => void;
}

const CommunicationCard: React.FC<ContainerProps> = ({ communication, preview, select, toggleMarkAsRead }) => {
  return communication ? (
    <IonCard color="white">
      {communication.imageURI ? (
        <IonImg
          src={getImageURLByURI(communication.imageURI)}
          onIonError={(e: any) => (e.target.src = newsFallbackImageURL)}
        ></IonImg>
      ) : (
        ''
      )}
      <IonCardHeader style={{ paddingBottom: 0 }}>
        <IonRow>
          <IonCol size="10">
            <IonCardSubtitle style={{ fontWeight: 300 }}>
              {formatDateShort(communication.publishedAt)}, {formatTime(communication.publishedAt)}
            </IonCardSubtitle>
            <IonCardTitle>
              <h2 style={{ marginTop: 3 }}>{communication.title}</h2>
            </IonCardTitle>
          </IonCol>
          {preview ? (
            <IonCol size="2" className="ion-text-right">
              <IonButton
                fill="clear"
                color={communication.hasBeenReadByUser ? 'medium' : 'primary'}
                size="small"
                onClick={() => (toggleMarkAsRead ? toggleMarkAsRead() : null)}
              >
                <IonIcon
                  icon={communication.hasBeenReadByUser ? mailOpenOutline : mailUnreadOutline}
                  slot="icon-only"
                ></IonIcon>
              </IonButton>
            </IonCol>
          ) : (
            ''
          )}
        </IonRow>
      </IonCardHeader>
      <IonCardContent>
        {preview ? (
          <>
            <p
              className="ion-padding"
              style={{ textAlign: 'justify' }}
              dangerouslySetInnerHTML={{
                __html: mdParser.render(
                  communication.content.length > 320
                    ? communication.content.slice(0, 320).concat('...')
                    : communication.content
                )
              }}
            ></p>
            <IonButton expand="block" fill="clear" onClick={select}>
              Read more
            </IonButton>
          </>
        ) : (
          <p className="ion-padding">
            {communication.content ? (
              <span dangerouslySetInnerHTML={{ __html: mdParser.render(communication.content) }}></span>
            ) : (
              ''
            )}
          </p>
        )}
      </IonCardContent>
    </IonCard>
  ) : (
    <IonCard color="white">
      <IonCardHeader>
        <IonCardSubtitle>
          <IonSkeletonText animated style={{ width: '40%' }} />
        </IonCardSubtitle>
        <IonCardTitle>
          <IonSkeletonText animated style={{ width: '60%', height: 30 }} />
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonSkeletonText animated />
        <IonSkeletonText animated />
        <IonSkeletonText animated />
        <IonSkeletonText animated />
        <IonSkeletonText animated />
      </IonCardContent>
    </IonCard>
  );
};

export default CommunicationCard;
