import { Link } from 'react-router-dom';
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
import { calendarOutline, locationOutline, peopleOutline, star, starOutline } from 'ionicons/icons';

import { Session } from 'models/session';
import { Speaker } from 'models/speaker';
import { SessionTypeStr, SessionTypeColor, formatTime, formatDateShort, isMobileMode } from '../utils';

interface ContainerProps {
  session?: Session;
  isUserFavorite?: boolean;
  toggleUserFavoriteSession?: () => void;
}

const SessionCard: React.FC<ContainerProps> = ({ session, isUserFavorite, toggleUserFavoriteSession }) => {
  return session ? (
    <IonCard
      color="white"
      style={
        isMobileMode()
          ? { boxShadow: 'none', margin: '0', width: '100%' }
          : { boxShadow: '0 0 5px 3px rgba(0, 0, 0, 0.05)', marginTop: 15 }
      }
    >
      <IonCardHeader>
        <IonRow className="ion-no-padding">
          <IonCol size="10">
            <IonCardSubtitle style={{ marginBottom: 4 }}>
              <IonBadge color={SessionTypeColor[session.type]}>{SessionTypeStr[session.type]}</IonBadge>
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
                {isUserFavorite ? (
                  <IonIcon icon={star}></IonIcon>
                ) : (
                  <>
                    <b>Star</b> <IonIcon icon={starOutline} slot="end"></IonIcon>
                  </>
                )}
              </IonButton>
            </IonCol>
          ) : (
            ''
          )}
        </IonRow>
      </IonCardHeader>
      <IonCardContent>
        <IonList lines="none" className="ion-no-padding">
          <IonItem color="transparent">
            <IonIcon slot="start" icon={calendarOutline}></IonIcon>
            <IonLabel className="ion-text-wrap">
              {formatDateShort(session.startsAt)}
              <br /> {formatTime(session.startsAt)} {' - '} {formatTime(session.endsAt)}
            </IonLabel>
          </IonItem>
          <IonItem color="transparent">
            <IonIcon slot="start" icon={locationOutline}></IonIcon>
            <IonLabel className="ion-text-wrap">
              <Link to={'/venue/' + session.venue.venueId}>{session.venue.name}</Link>
            </IonLabel>
          </IonItem>
          <IonItem color="transparent">
            <IonIcon slot="start" icon={peopleOutline}></IonIcon>
            <IonLabel className="ion-text-wrap">
              <Link
                key={session.speaker1.speakerId}
                to={'/speaker/' + session.speaker1.speakerId}
                style={{ display: 'block' }}
              >
                {session.speaker1.name}
                {Speaker.getRole(session.speaker1) ? ` (${Speaker.getRole(session.speaker1)})` : ''}
              </Link>
              {session.speaker2.speakerId ? (
                <Link
                  key={session.speaker2.speakerId}
                  to={'/speaker/' + session.speaker2.speakerId}
                  style={{ display: 'block' }}
                >
                  {session.speaker2.name}
                  {Speaker.getRole(session.speaker2) ? ` (${Speaker.getRole(session.speaker2)})` : ''}
                </Link>
              ) : (
                ''
              )}
              {session.speaker3.speakerId ? (
                <Link
                  key={session.speaker3.speakerId}
                  to={'/speaker/' + session.speaker3.speakerId}
                  style={{ display: 'block' }}
                >
                  {session.speaker3.name}
                  {Speaker.getRole(session.speaker3) ? ` (${Speaker.getRole(session.speaker3)})` : ''}
                </Link>
              ) : (
                ''
              )}
            </IonLabel>
          </IonItem>

          <p className="ion-padding">
            <IonItem color="light">
              <IonLabel className="ion-text-wrap">{session.description}</IonLabel>
            </IonItem>
          </p>
        </IonList>
      </IonCardContent>
    </IonCard>
  ) : (
    <IonCard>
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
            <IonIcon slot="start" icon={peopleOutline}></IonIcon>
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
