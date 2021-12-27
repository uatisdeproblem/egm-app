import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Agenda.css';

const Agenda: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Agenda</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Agenda</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Agenda page" />
      </IonContent>
    </IonPage>
  );
};

export default Agenda;
