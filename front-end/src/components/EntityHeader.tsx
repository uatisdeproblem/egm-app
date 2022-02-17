import { useHistory } from 'react-router';
import { IonHeader, IonTitle, IonToolbar, IonIcon, IonButtons, IonButton } from '@ionic/react';
import { close } from 'ionicons/icons';

import { EntityType } from 'models/entity';

import ManageEntityButton from '../components/ManageEntityButton';

interface ContainerProps {
  title: string;
  type: EntityType;
  id: string;
}

const EntityHeader: React.FC<ContainerProps> = ({ title, type, id }) => {
  const history = useHistory();

  return (
    <IonHeader>
      <IonToolbar color="ideaToolbar">
        <IonTitle>{title}</IonTitle>
        <IonButtons slot="start">
          <IonButton onClick={() => history.goBack()}>
            <IonIcon icon={close} slot="icon-only"></IonIcon>
          </IonButton>
        </IonButtons>
        <IonButtons slot="end">
          <ManageEntityButton type={type} id={id}></ManageEntityButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default EntityHeader;
