import { Link } from 'react-router-dom';
import { IonLabel, IonBadge, IonIcon, IonItem, IonSkeletonText, IonButton, IonNote, IonText } from '@ionic/react';
import { locationOutline, peopleOutline, star, starOutline } from 'ionicons/icons';

import { Session } from 'models/session';
import { Speaker } from 'models/speaker';
import { SessionTypeStr, SessionTypeColor, formatTime } from '../utils';

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
      <IonNote slot="start" className="ion-text-center" style={{ marginTop: 4, lineHeight: 1.5 }}>
        <b style={{ display: 'block' }}>{formatTime(session.startsAt)}</b>
        <span style={{ display: 'block' }}>{formatTime(session.endsAt)}</span>
        <IonButton fill="clear" size="small" color="secondary" onClick={toggleUserFavoriteWithPrevention}>
          <IonIcon icon={isUserFavorite ? star : starOutline}></IonIcon>
        </IonButton>
      </IonNote>
      <IonLabel className="ion-text-wrap">
        <IonText style={{ fontWeight: 500 }}>{session.name}</IonText>
        <p
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {session.description}
        </p>
        <p>
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
          {session.speakers.map(speaker => (
            <Link
              key={speaker.speakerId}
              onClick={(e: any) => e.stopPropagation()}
              to={'/speaker/' + speaker.speakerId}
              style={{ marginRight: 10 }}
            >
              {speaker.name}
              {Speaker.getRole(speaker) ? ` (${Speaker.getRole(speaker)})` : ''}
            </Link>
          ))}
        </p>
      </IonLabel>
      <IonBadge slot="end" color={SessionTypeColor[session.type]}>
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
