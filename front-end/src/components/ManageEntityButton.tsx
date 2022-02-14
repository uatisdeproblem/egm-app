import { useEffect, useState } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { construct } from 'ionicons/icons';

import { EntityType } from 'models/entity';

import { isUserAdmin } from '../utils/data';

interface ComponentProps {
  type: EntityType;
  id: string;
}

const ManageEntityButton: React.FC<ComponentProps> = ({ type, id }) => {
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    setUserIsAdmin(await isUserAdmin());
  };

  return userIsAdmin ? (
    <p className="ion-text-right">
      <IonButton fill="clear" expand="block" routerLink={`/manage/${type}/${id}`}>
        Manage <IonIcon icon={construct} slot="end"></IonIcon>
      </IonButton>
    </p>
  ) : (
    <></>
  );
};

export default ManageEntityButton;
