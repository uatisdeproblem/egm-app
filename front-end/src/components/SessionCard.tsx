import {
  IonList,
  IonLabel,
  IonBadge,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonItem,
  IonSkeletonText,
  IonButton,
  IonRow,
  IonCol
} from '@ionic/react';
import { calendarOutline, locationOutline, micOutline, star, starOutline } from 'ionicons/icons';

import { Session } from 'models/session';
import { Speaker } from 'models/speaker';
import { SessionTypeStr, SessionTypeColor, formatTime, formatDateShort, mdParser } from '../utils';

interface ContainerProps {
  session?: Session;
  isUserFavorite?: boolean;
  toggleUserFavoriteSession?: () => void;
}

const SessionCard: React.FC<ContainerProps> = ({ session, isUserFavorite, toggleUserFavoriteSession }) => {
  return session ? (
    <IonCard color="white">
      <IonCardHeader>
        <IonRow className="ion-no-padding">
          <IonCol size="10">
            <IonCardSubtitle style={{ marginBottom: 4 }}>
              <IonBadge color={SessionTypeColor[session.type]}>{SessionTypeStr[session.type]}</IonBadge>
              {session.code ? (
                <IonBadge color="light" style={{ marginLeft: 10 }}>
                  {session.code}
                </IonBadge>
              ) : (
                ''
              )}
            </IonCardSubtitle>
            <IonCardTitle>
              <IonLabel>
                <h1>{session.name}</h1>
              </IonLabel>
            </IonCardTitle>
          </IonCol>
          {isUserFavorite !== undefined ? (
            <IonCol size="2" className="ion-text-right">
              <IonButton fill="clear" color="secondary" onClick={toggleUserFavoriteSession}>
                <IonIcon icon={isUserFavorite ? star : starOutline}></IonIcon>
              </IonButton>
            </IonCol>
          ) : (
            ''
          )}
        </IonRow>
      </IonCardHeader>
      <IonCardContent>
        <IonList lines="none" className="ion-no-padding">
          <IonItem color="white">
            <IonIcon slot="start" icon={calendarOutline}></IonIcon>
            <IonLabel className="ion-text-wrap">
              {formatDateShort(session.startsAt)}
              <br /> {formatTime(session.startsAt)} {' - '} {formatTime(session.endsAt)}
            </IonLabel>
          </IonItem>
          <IonItem color="white" routerLink={'/room/' + session.room.roomId}>
            <IonIcon slot="start" icon={locationOutline}></IonIcon>
            <IonLabel className="ion-text-wrap">
              {session.room.name} ({session.room.venue.name})
            </IonLabel>
          </IonItem>
          <IonItem color="white" routerLink={'/speaker/' + session.speaker1.speakerId}>
            <IonIcon slot="start" icon={micOutline}></IonIcon>
            <IonLabel className="ion-text-wrap">
              {session.speaker1.name}
              <p>{Speaker.getRole(session.speaker1)}</p>
            </IonLabel>
          </IonItem>
          {session.speaker2?.speakerId ? (
            <IonItem color="white" routerLink={'/speaker/' + session.speaker2.speakerId}>
              <IonIcon slot="start"></IonIcon>
              <IonLabel>
                {session.speaker2.name}
                <p>{Speaker.getRole(session.speaker2)}</p>
              </IonLabel>
            </IonItem>
          ) : (
            ''
          )}
          {session.speaker3?.speakerId ? (
            <IonItem color="white" routerLink={'/speaker/' + session.speaker3.speakerId}>
              <IonIcon slot="start"></IonIcon>
              <IonLabel>
                {session.speaker3?.name}
                <p>{Speaker.getRole(session.speaker3)}</p>
              </IonLabel>
            </IonItem>
          ) : (
            ''
          )}
          {session.speaker4?.speakerId ? (
            <IonItem color="white" routerLink={'/speaker/' + session.speaker4.speakerId}>
              <IonIcon slot="start"></IonIcon>
              <IonLabel>
                {session.speaker4.name}
                <p>{Speaker.getRole(session.speaker4)}</p>
              </IonLabel>
            </IonItem>
          ) : (
            ''
          )}
          {session.speaker5?.speakerId ? (
            <IonItem color="white" routerLink={'/speaker/' + session.speaker5.speakerId}>
              <IonIcon slot="start"></IonIcon>
              <IonLabel>
                {session.speaker5.name}
                <p>{Speaker.getRole(session.speaker5)}</p>
              </IonLabel>
            </IonItem>
          ) : (
            ''
          )}

          <div className="divDescription" style={{ marginTop: 12 }}>
            {session.description ? (
              <span dangerouslySetInnerHTML={{ __html: mdParser.render(session.description) }}></span>
            ) : (
              ''
            )}
          </div>
        </IonList>
      </IonCardContent>
    </IonCard>
  ) : (
    <IonCard color="white">
      <IonCardHeader>
        <IonCardTitle>
          <IonLabel>
            <IonSkeletonText animated style={{ width: '60%' }} />
          </IonLabel>
        </IonCardTitle>
        <IonCardSubtitle>
          <IonSkeletonText animated style={{ width: '30%' }} />
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList lines="none">
          <IonItem>
            <IonIcon slot="start" icon={calendarOutline}></IonIcon>
            <IonLabel>
              <IonSkeletonText animated style={{ width: '40%' }} />
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon slot="start" icon={locationOutline}></IonIcon>
            <IonLabel>
              <IonSkeletonText animated style={{ width: '60%' }} />
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon slot="start" icon={micOutline}></IonIcon>
            <IonLabel>
              <IonSkeletonText animated style={{ width: '60%' }} />
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <IonSkeletonText animated style={{ width: '80%' }} />
              <IonSkeletonText animated style={{ width: '70%' }} />
              <IonSkeletonText animated style={{ width: '60%' }} />
              <IonSkeletonText animated style={{ width: '50%' }} />
            </IonLabel>
          </IonItem>
        </IonList>
      </IonCardContent>
    </IonCard>
  );
};

export default SessionCard;
