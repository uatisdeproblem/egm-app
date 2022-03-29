import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSkeletonText,
  IonImg,
  IonCardSubtitle,
  IonButton,
  IonIcon
} from '@ionic/react';
import { navigate } from 'ionicons/icons';

import { Venue } from 'models/venue';

import { mdParser, openGeoLocationInMap } from '../utils';
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
        <IonCardSubtitle>{venue.address}</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        {venue.address ? (
          <div className="ion-text-right" style={{ marginBottom: 30 }}>
            <IonButton onClick={() => openGeoLocationInMap(venue.latitude, venue.longitude)}>
              Navigate to the venue <IonIcon icon={navigate} slot="end"></IonIcon>
            </IonButton>
          </div>
        ) : (
          ''
        )}
        <div className="divDescription">
          {venue.description ? (
            <span dangerouslySetInnerHTML={{ __html: mdParser.render(venue.description) }}></span>
          ) : (
            ''
          )}
        </div>
      </IonCardContent>
    </IonCard>
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

export default VenueCard;
