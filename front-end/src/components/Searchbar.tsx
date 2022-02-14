import { useEffect, useState } from 'react';
import { IonButton, IonCol, IonIcon, IonRow, IonSearchbar } from '@ionic/react';
import { refresh } from 'ionicons/icons';

import { isUserAdmin } from '../utils/data';

interface ComponentProps {
  placeholder: string;
  filterFn: (searchStr: string) => void;
  refreshFn: () => void;
}

const Searchbar: React.FC<ComponentProps> = ({ placeholder, filterFn, refreshFn }) => {
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    setUserIsAdmin(await isUserAdmin());
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <IonRow className="ion-align-items-center">
        <IonCol size={userIsAdmin ? '10' : '12'}>
          <IonSearchbar
            color="white"
            placeholder={placeholder}
            onIonChange={e => filterFn(e.detail.value!)}
          ></IonSearchbar>
        </IonCol>
        {userIsAdmin ? (
          <IonCol size="2">
            <IonButton fill="clear" color="medium" expand="block" onClick={refreshFn}>
              <IonIcon icon={refresh} slot="icon-only"></IonIcon>
            </IonButton>
          </IonCol>
        ) : (
          ''
        )}
      </IonRow>
    </div>
  );
};

export default Searchbar;
