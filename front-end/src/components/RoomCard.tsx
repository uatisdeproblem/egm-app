import { Link } from 'react-router-dom';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSkeletonText,
  IonImg,
  IonCardSubtitle,
  IonItem,
  IonLabel,
  IonIcon
} from '@ionic/react';
import { locationOutline } from 'ionicons/icons';

import { Room } from 'models/room';

import { mdParser } from '../utils';
import { getImageURLByURI, venuesFallbackImageURL } from '../utils/data';

interface ContainerProps {
  room?: Room;
  preview?: boolean;
  select?: () => void;
}

const RoomCard: React.FC<ContainerProps> = ({ room, preview, select }) => {
  return room ? (
    preview ? (
      <IonItem color="white" button={!!select} onClick={select}>
        <IonLabel>
          {room.name}
          <p>{room.internalLocation}</p>
        </IonLabel>
      </IonItem>
    ) : (
      <IonCard color="white">
        <IonImg
          src={getImageURLByURI(room.imageURI)}
          onIonError={(e: any) => (e.target.src = venuesFallbackImageURL)}
        ></IonImg>
        <IonCardHeader>
          <IonCardSubtitle style={{ fontWeight: 300 }} className="ion-text-right">
            <Link to={'/venue/' + room.venue.venueId}>
              <IonIcon icon={locationOutline}></IonIcon> {room.venue.name}
            </Link>
          </IonCardSubtitle>
          <IonCardTitle>{room.name}</IonCardTitle>
          <IonCardSubtitle>{room.internalLocation}</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="divDescription">
            {room.description ? (
              <span dangerouslySetInnerHTML={{ __html: mdParser.render(room.description) }}></span>
            ) : (
              ''
            )}
          </div>
        </IonCardContent>
      </IonCard>
    )
  ) : (
    <IonCard color="white">
      <IonSkeletonText animated style={{ height: 200 }} />
      <IonCardHeader>
        <IonCardTitle>
          <IonSkeletonText animated style={{ width: '60%' }} />
        </IonCardTitle>
        <IonCardSubtitle>
          <IonSkeletonText animated style={{ width: '50%' }} />
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <IonSkeletonText animated style={{ width: '80%' }} />
        <IonSkeletonText animated style={{ width: '70%' }} />
        <IonSkeletonText animated style={{ width: '60%' }} />
      </IonCardContent>
    </IonCard>
  );
};

export default RoomCard;
