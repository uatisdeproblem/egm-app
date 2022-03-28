import { Link } from 'react-router-dom';
import { IonLabel, IonBadge, IonIcon, IonItem, IonSkeletonText, IonButton, IonNote, IonText } from '@ionic/react';
import { locationOutline, peopleOutline, star, starOutline } from 'ionicons/icons';

import { Session } from 'models/session';
import { SessionTypeStr, SessionTypeColor, formatTime, formatDateShort } from '../utils';

interface ContainerProps {
  session?: Session;
  isUserFavorite?: boolean;
  toggleUserFavorite?: () => void;
  select?: () => void;
}

const SessionItem: React.FC<ContainerProps> = ({ session, isUserFavorite, toggleUserFavorite, select }) => {
  const toggleUserFavoriteWithPrevention = (e: any) => {
    e.stopPropagation();
    if (toggleUserFavorite) toggleUserFavorite();
  };

  return session ? (
    <IonItem lines="none" color="white" style={itemStyle} key={session.sessionId} button onClick={select}>
      <IonNote slot="start" className="ion-text-center" style={{ marginRight: 18, lineHeight: 1.4 }}>
        <b style={{ display: 'block' }}>{formatTime(session.startsAt)}</b>
        <span style={{ display: 'block' }}>{formatTime(session.endsAt)}</span>
        {toggleUserFavorite ? (
          <IonButton fill="clear" size="small" color="secondary" onClick={toggleUserFavoriteWithPrevention}>
            <IonIcon icon={isUserFavorite ? star : starOutline}></IonIcon>
          </IonButton>
        ) : (
          <span style={{ display: 'block', marginTop: 6 }}>{formatDateShort(session.startsAt)}</span>
        )}
      </IonNote>
      <IonLabel className="ion-text-wrap">
        <IonText style={{ fontWeight: 500 }}>{session.name}</IonText>
        <p className="ion-hide-sm-up" style={{ paddingBottom: 2 }}>
          <IonBadge style={{ marginTop: 2, fontSize: '0.8em' }} color={SessionTypeColor[session.type]}>
            {SessionTypeStr[session.type]}
          </IonBadge>
        </p>
        <p style={{ marginTop: 4 }}>
          <IonIcon icon={locationOutline} style={{ verticalAlign: 'middle', marginRight: 4 }}></IonIcon>
          {session.venue ? (
            <Link onClick={(e: any) => e.stopPropagation()} to={'/venue/' + session.venue.venueId}>
              {session.venue.name}
            </Link>
          ) : (
            ''
          )}
          <br />
          <IonIcon icon={peopleOutline} style={{ verticalAlign: 'middle', marginRight: 4 }}></IonIcon>
          <Link
            key={session.speaker1.speakerId}
            onClick={(e: any) => e.stopPropagation()}
            to={'/speaker/' + session.speaker1.speakerId}
          >
            {session.speaker1.name}
          </Link>
          {session.speaker2.speakerId ? (
            <>
              ,{' '}
              <Link
                key={session.speaker2.speakerId}
                onClick={(e: any) => e.stopPropagation()}
                to={'/speaker/' + session.speaker2.speakerId}
              >
                {session.speaker2.name}
              </Link>
            </>
          ) : (
            ''
          )}
          {session.speaker3.speakerId ? (
            <>
              ,{' '}
              <Link
                key={session.speaker3.speakerId}
                onClick={(e: any) => e.stopPropagation()}
                to={'/speaker/' + session.speaker3.speakerId}
              >
                {session.speaker3.name}
              </Link>
            </>
          ) : (
            ''
          )}
          {session.speaker4.speakerId ? (
            <>
              ,{' '}
              <Link
                key={session.speaker4.speakerId}
                onClick={(e: any) => e.stopPropagation()}
                to={'/speaker/' + session.speaker4.speakerId}
              >
                {session.speaker4.name}
              </Link>
            </>
          ) : (
            ''
          )}
          {session.speaker5.speakerId ? (
            <>
              ,{' '}
              <Link
                key={session.speaker5.speakerId}
                onClick={(e: any) => e.stopPropagation()}
                to={'/speaker/' + session.speaker5.speakerId}
                style={{ marginRight: 10 }}
              >
                {session.speaker5.name}
              </Link>
            </>
          ) : (
            ''
          )}
        </p>
      </IonLabel>
      <IonBadge slot="end" color={SessionTypeColor[session.type]} className="ion-hide-sm-down">
        {SessionTypeStr[session.type]}
      </IonBadge>
    </IonItem>
  ) : (
    <IonItem lines="none" color="white" style={itemStyle}>
      <IonLabel>
        <IonSkeletonText animated style={{ width: '80%' }} />
        <p>
          <IonSkeletonText animated style={{ width: '70%' }} />
        </p>
        <p>
          <IonSkeletonText animated style={{ width: '60%' }} />
        </p>
        <p>
          <IonSkeletonText animated style={{ width: '50%' }} />
        </p>
      </IonLabel>
    </IonItem>
  );
};

export default SessionItem;

const itemStyle = { boxShadow: '0 0 5px 3px rgba(0, 0, 0, 0.05)', borderRadius: 12, margin: 8 };
