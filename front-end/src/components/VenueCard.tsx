import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSkeletonText,
  IonImg,
  IonItem,
  IonLabel
} from '@ionic/react';

import { Venue } from 'models/venue';
import { getImageURLByURI, venuesFallbackImageURL } from '../utils/data';

interface ContainerProps {
  venue?: Venue;
}

const VenueCard: React.FC<ContainerProps> = ({ venue }) => {
  return venue ? (
    <IonCard color="white">
      <IonImg
        src={getImageURLByURI(venue.imageURI)}
        onIonError={(e: any) => (e.target.src = venuesFallbackImageURL)}
      ></IonImg>
      <IonCardHeader>
        <IonCardTitle>{venue.name}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonItem color="light" lines="none">
          <IonLabel className="ion-text-wrap">{venue.description}</IonLabel>
        </IonItem>
      </IonCardContent>
    </IonCard>
  ) : (
    <IonCard color="white">
      <IonSkeletonText animated style={{ height: 200 }} />
      <IonCardHeader>
        <IonCardTitle>
          <IonSkeletonText animated style={{ width: '60%' }} />
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

export default VenueCard;
