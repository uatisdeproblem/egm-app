import {
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSkeletonText,
  IonRow,
  IonCol,
  IonImg,
  IonThumbnail
} from '@ionic/react';

import { Organization } from '../models';

const fallbackOrganizationLogo = '/assets/images/no-logo.jpg';

interface ContainerProps {
  organization?: Organization;
  preview?: boolean;
  select?: () => void;
}

const OrganizationCard: React.FC<ContainerProps> = ({ organization, preview, select }) => {
  return organization ? (
    <IonCard
      button={!!select}
      onClick={select}
      color="white"
      style={{
        boxShadow: '0 0 5px 3px rgba(0, 0, 0, 0.05)',
        margin: '0',
        width: '100%',
        height: preview ? '100%' : 'auto'
      }}
    >
      <IonCardHeader>
        <IonRow className="ion-align-items-center">
          <IonCol size={preview ? '12' : '3'} style={{ background: 'white', padding: 20, borderRadius: 10 }}>
            <IonImg
              src={organization.logoURL || fallbackOrganizationLogo}
              onIonError={(e: any) => (e.target.src = fallbackOrganizationLogo)}
              style={{ margin: '0 auto', maxWidth: 200, maxHeight: 80 }}
            ></IonImg>
          </IonCol>
          <IonCol size={preview ? '12' : '9'} style={{ paddingLeft: 20 }}>
            <IonCardTitle>
              <h2 className={preview ? 'ion-text-center' : ''}>{organization.name}</h2>
            </IonCardTitle>
          </IonCol>
        </IonRow>
      </IonCardHeader>
      <IonCardContent>{preview ? '' : organization.description}</IonCardContent>
    </IonCard>
  ) : (
    <IonCard onClick={select}>
      <IonCardHeader>
        <IonRow>
          <IonCol>
            <IonThumbnail>
              <IonSkeletonText animated />
            </IonThumbnail>
          </IonCol>
          <IonCol>
            <IonCardTitle>
              <IonSkeletonText animated style={{ width: '60%' }} />
            </IonCardTitle>
          </IonCol>
        </IonRow>
        <IonCardTitle>
          <IonLabel></IonLabel>
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

export default OrganizationCard;
