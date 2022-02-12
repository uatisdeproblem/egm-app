import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonSkeletonText, IonImg } from '@ionic/react';

import { Venue } from 'models/venue';
import { venuesFallbackImageURL, getVenueImageURL } from '../utils/data';

interface ContainerProps {
  venue?: Venue;
}

const VenueCard: React.FC<ContainerProps> = ({ venue }) => {
  return venue ? (
    <IonCard color="white" style={cardStyle}>
      <IonImg src={getVenueImageURL(venue)} onIonError={(e: any) => (e.target.src = venuesFallbackImageURL)}></IonImg>
      <IonCardHeader>
        <IonCardTitle>{venue.name}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>{venue.description}</IonCardContent>
    </IonCard>
  ) : (
    <IonCard color="white" style={cardStyle}>
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

const cardStyle = { boxShadow: 'none', margin: '0', width: '100%' };
