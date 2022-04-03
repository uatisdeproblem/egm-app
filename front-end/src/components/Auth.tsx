import { useAuthenticator } from '@aws-amplify/ui-react';
import '../theme/amplify-ui-react.css';

import { IonIcon, IonImg, IonText } from '@ionic/react';
import { openOutline } from 'ionicons/icons';

import { getEnv } from '../environment';
const env = getEnv();

export const AuthHeader = () => {
  const { isPending } = useAuthenticator();
  return isPending === undefined ? (
    <></>
  ) : (
    <div className="ion-padding ion-text-center" style={{ marginTop: 30 }}>
      <IonImg
        src="/assets/images/ESN-star-full-colour.png"
        style={{ width: 100, margin: '0 auto', marginBottom: 20 }}
      />
    </div>
  );
};

export const AuthFooter = () => {
  const { isPending } = useAuthenticator();

  // fix known Cognito bug (QuotaExceededError): https://github.com/aws-amplify/amplify-js/issues/9140
  // if (isPending === false && !user && window.localStorage.length) window.localStorage.clear();

  return isPending === undefined ? (
    <></>
  ) : (
    <div className="ion-padding ion-text-center">
      <p>
        <a target="_blank" rel="noreferrer" href="https://meeting.erasmusgeneration.org">
          Discover the Erasmus Generation Meeting <IonIcon icon={openOutline}></IonIcon>
        </a>
      </p>
      <p>
        <a target="_blank" rel="noreferrer" href={env.privacyPolicyURL}>
          Privacy Policy <IonIcon icon={openOutline}></IonIcon>
        </a>
      </p>
      <p>
        <IonText style={{ color: 'var(--ion-color-step-300)' }}>v{getEnv().version}</IonText>
      </p>
    </div>
  );
};
