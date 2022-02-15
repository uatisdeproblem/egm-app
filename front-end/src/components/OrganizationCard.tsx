import {
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSkeletonText,
  IonImg,
  IonItem,
  IonTitle
} from '@ionic/react';

import { Organization } from 'models/organization';
import { getImageURLByURI, organizationsFallbackImageURL } from '../utils/data';

interface ContainerProps {
  organization?: Organization;
  preview?: boolean;
  select?: () => void;
}

const OrganizationCard: React.FC<ContainerProps> = ({ organization, preview, select }) => {
  return organization ? (
    <IonCard button={!!select} onClick={select} color="white" style={{ height: preview ? '130px' : 'auto' }}>
      <IonCardHeader>
        {organization.imageURI ? (
          <div style={{ background: 'white', borderRadius: 4, padding: 4 }}>
            <IonImg
              src={getImageURLByURI(organization.imageURI)}
              onIonError={(e: any) => (e.target.src = organizationsFallbackImageURL)}
              style={{
                margin: '0 auto',
                maxWidth: preview ? 150 : 250,
                height: preview ? 90 : 'auto'
              }}
            ></IonImg>
          </div>
        ) : (
          <IonTitle>
            <h2 className="ion-text-center">{organization.name}</h2>
          </IonTitle>
        )}
      </IonCardHeader>
      {preview ? (
        ''
      ) : (
        <IonCardContent>
          <>
            {organization.imageURI ? (
              <IonItem color="white" lines="none">
                <IonLabel className="ion-text-center">
                  <b>{organization.name}</b>
                </IonLabel>
              </IonItem>
            ) : (
              ''
            )}
            <IonItem color="light" lines="none">
              <IonLabel className="ion-text-wrap">{organization.description}</IonLabel>
            </IonItem>
          </>
        </IonCardContent>
      )}
    </IonCard>
  ) : (
    <IonCard color="white">
      <IonCardHeader>
        <IonCardTitle>
          <IonSkeletonText animated style={{ height: 90 }} />
        </IonCardTitle>
      </IonCardHeader>
      {preview ? (
        ''
      ) : (
        <IonCardContent>
          <IonSkeletonText animated style={{ width: '80%' }} />
          <IonSkeletonText animated style={{ width: '70%' }} />
          <IonSkeletonText animated style={{ width: '60%' }} />
        </IonCardContent>
      )}
    </IonCard>
  );
};

export default OrganizationCard;
