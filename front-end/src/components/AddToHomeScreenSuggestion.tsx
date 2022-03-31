import { useEffect } from 'react';
import { useIonToast } from '@ionic/react';
import { isPlatform } from '@ionic/core';

const LOCAL_STORAGE_KEY = 'addToHomeScreenSuggestion';

const AddToHomeScreenSuggestion: React.FC = () => {
  const [showMessage, dismissMessage] = useIonToast();

  useEffect(() => {
    const loadData = async () => {
      if (!(isPlatform('android') || isPlatform('ios')) || isAlreadyStandalone() || !window.localStorage) return;

      if (window.localStorage.getItem(LOCAL_STORAGE_KEY)) return;

      showSuggestion();
    };
    loadData();
  }, []);

  const isAlreadyStandalone = (): boolean => window.matchMedia('(display-mode: standalone)').matches;

  const showSuggestion = async (): Promise<void> => {
    const message = 'You can add the app to your homescreen for a better experience. 🙌';
    const position = 'top';
    const color = 'dark';
    const buttons = [
      { text: 'How to', handler: openInstructions },
      { text: 'X', handler: dimissSuggestionForeverOnDevice }
    ];

    await showMessage({ message, color, buttons, position });
  };

  const openInstructions = async (): Promise<void> => {
    const androidURL = 'https://www.howtogeek.com/667938';
    const iosURL = 'https://www.howtogeek.com/667910';
    window.location.assign(isPlatform('ios') ? iosURL : androidURL);
    dismissMessage();
  };

  const dimissSuggestionForeverOnDevice = (): void => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, 'hide');
    dismissMessage();
  };

  return <></>;
};

export default AddToHomeScreenSuggestion;
