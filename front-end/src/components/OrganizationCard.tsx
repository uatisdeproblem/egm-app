import {
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSkeletonText,
  IonImg,
  IonItem,
  IonTitle,
  IonButton,
  IonIcon
} from '@ionic/react';
import { chatbubbles, openOutline } from 'ionicons/icons';

import { Organization } from 'models/organization';

import { mdParser } from '../utils';
import { getImageURLByURI, organizationsFallbackImageURL } from '../utils/data';

import ContactOrganizationButton from './ContactOrganizationButton';

interface ContainerProps {
  organization?: Organization;
  preview?: boolean;
  select?: () => void;
}

const OrganizationCard: React.FC<ContainerProps> = ({ organization, preview, select }) => {
  return organization ? (
    <IonCard button={!!select} onClick={select} color="white" style={{ height: preview ? '160px' : 'auto' }}>
      <IonCardHeader>
        {organization.imageURI ? (
          <div style={{ background: 'white', borderRadius: 4, padding: '20px 4px' }}>
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
            <h2 className="ion-text-center ion-text-wrap">{organization.name}</h2>
          </IonTitle>
        )}
      </IonCardHeader>
      {preview ? (
        ''
      ) : (
        <IonCardContent>
          {organization.contactEmail || organization.website || organization.contactAction ? (
            <div className="ion-text-center" style={{ marginBottom: 30 }}>
              {organization.website ? (
                <IonButton fill="clear" color="dark" target="_blank" href={organization.website}>
                  Discover more <IonIcon icon={openOutline} slot="end"></IonIcon>
                </IonButton>
              ) : (
                ''
              )}
              {organization.contactAction ? (
                <IonButton target="_blank" href={organization.contactAction}>
                  I'd like to get in contact <IonIcon icon={chatbubbles} slot="end"></IonIcon>
                </IonButton>
              ) : (
                ''
              )}
              {true ? (
                // disabled #45
                ''
              ) : (
                <ContactOrganizationButton organization={organization!}></ContactOrganizationButton>
              )}
            </div>
          ) : (
            ''
          )}
          <>
            {organization.imageURI ? (
              <IonItem color="white" lines="none">
                <IonLabel className="ion-text-center">
                  About <b>{organization.name}</b>
                </IonLabel>
              </IonItem>
            ) : (
              ''
            )}

            <div className="divDescription">
              {organization.description ? (
                <span dangerouslySetInnerHTML={{ __html: mdParser.render(organization.description) }}></span>
              ) : (
                ''
              )}
            </div>
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
