import { forwardRef, useEffect, useState } from 'react';
import { IonCol, IonRefresher, IonRefresherContent, IonRow, IonSearchbar, RefresherEventDetail } from '@ionic/react';

import { isUserAdmin } from '../utils/data';
import { isMobileMode } from '../utils';

interface ComponentProps {
  placeholder: string;
  filterFn: (searchStr: string) => void;
  refreshFn?: () => void;
}

const Searchbar = forwardRef(({ placeholder, filterFn, refreshFn }: ComponentProps, ref) => {
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    setUserIsAdmin(await isUserAdmin());
  };

  const refreshFnWithRefresherWrapper = (event: CustomEvent<RefresherEventDetail>): void => {
    if (!refreshFn) return;

    setTimeout((): void => {
      event.detail.complete();
      refreshFn();
    }, 2000);
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      {userIsAdmin && isMobileMode() && refreshFn ? (
        <IonRefresher slot="fixed" onIonRefresh={refreshFnWithRefresherWrapper}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
      ) : (
        ''
      )}
      <IonRow className="ion-align-items-center">
        <IonCol size="12">
          <IonSearchbar
            color="white"
            ref={ref as any}
            placeholder={placeholder}
            onIonChange={e => filterFn(e.detail.value!)}
          ></IonSearchbar>
        </IonCol>
      </IonRow>
    </div>
  );
});

export default Searchbar;
