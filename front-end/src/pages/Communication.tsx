import { useState } from 'react';
import { IonCol, IonContent, IonGrid, IonPage, IonRow, useIonToast, useIonViewWillEnter } from '@ionic/react';

import { Communication } from 'models/communication';

import { toastMessageDefaults } from '../utils';
import { getCommunication, getURLPathResourceId } from '../utils/data';

import EntityHeader from '../components/EntityHeader';
import CommunicationCard from '../components/CommunicationCard';

const CommunicationPage: React.FC = () => {
  const [showMessage] = useIonToast();

  const [communication, setCommunication] = useState<Communication>();

  useIonViewWillEnter(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const communicationId = getURLPathResourceId();
      const communication = await getCommunication(communicationId);

      setCommunication(communication);
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Communication not found.' });
    }
  };

  return (
    <IonPage>
      <EntityHeader title="Communication" type="communication" id={communication?.communicationId || ''}></EntityHeader>
      <IonContent>
        <IonGrid className="contentGrid" style={{ maxWidth: 800 }}>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12">
              <CommunicationCard communication={communication}></CommunicationCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default CommunicationPage;
