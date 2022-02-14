import { useEffect, useState } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { construct } from 'ionicons/icons';

import { EntityType } from 'models/entity';

import { isUserAdmin } from '../utils/data';

interface ComponentProps {
  type: EntityType;
  id: string;
  full?: boolean;
}

const ManageEntityButton: React.FC<ComponentProps> = ({ type, id, full }) => {
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    setUserIsAdmin(await isUserAdmin());
  };

  return userIsAdmin ? (
    <IonButton fill="clear" expand="block" routerLink={`/manage/${type}/${id}`}>
      <IonIcon icon={construct} slot={full ? 'start' : 'icon-only'}></IonIcon> {full ? 'Manage' : ''}
    </IonButton>
  ) : (
    <></>
  );
};

export default ManageEntityButton;
