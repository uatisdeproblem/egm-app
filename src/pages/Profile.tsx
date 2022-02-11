import { createRef, useEffect, useState } from 'react';
import {
  IonAvatar,
  IonButton,
  IonContent,
  IonHeader,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
  useIonLoading,
  useIonToast
} from '@ionic/react';

import { isMobileMode, toastMessageDefaults } from '../utils';
import { getUserAvatarURL, getUserProfile, saveUserProfile, updateUserAvatar, fallbackUserAvatar } from '../utils/data';
import { ESNCountries, ESNSections } from '../utils/ESNSections';

const ProfilePage: React.FC = () => {
  const [showMessage] = useIonToast();
  const [showLoading, dismissLoading] = useIonLoading();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ESNCountry, setESNCountry] = useState('');
  const [ESNSection, setESNSection] = useState('');

  const [avatar, setAvatar] = useState('');
  const [avatarTempImageFile, setAvatarTempImageFile] = useState<File>();
  const fileInput = createRef<HTMLInputElement>();

  useEffect(() => {
    const loadData = async () => {
      const profile = await getUserProfile();
      if (profile) {
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setESNCountry(profile.ESNCountry || '');
        setESNSection(profile.ESNSection || '');
      }

      const avatar = await getUserAvatarURL();
      setAvatar(avatar);
    };
    loadData();
  }, []);

  const uploadNewAvatar = async (e: any): Promise<void> => {
    e.preventDefault();

    const reader = new FileReader();
    const file = e.target.files[0];

    try {
      reader.readAsDataURL(file);
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Error uploading the avatar.', color: 'danger' });
    }

    reader.onloadend = () => setAvatar(reader.result as string);

    setAvatarTempImageFile(file);
  };

  const handleSubmit = async (event: any): Promise<void> => {
    event.preventDefault();

    await showLoading();
    try {
      if (avatarTempImageFile) await updateUserAvatar(avatarTempImageFile);
      await saveUserProfile({ firstName, lastName, ESNCountry, ESNSection });
      await showMessage({ ...toastMessageDefaults, message: 'Profile saved.', color: 'success' });
    } catch (err) {
      await showMessage({
        ...toastMessageDefaults,
        message: 'Please, check the form and try again.',
        color: 'warning'
      });
    } finally {
      await dismissLoading();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        {isMobileMode() ? (
          <IonToolbar color="ideaToolbar">
            <IonTitle>Profile</IonTitle>
          </IonToolbar>
        ) : (
          ''
        )}
      </IonHeader>
      <IonContent>
        <IonList style={{ maxWidth: 450, margin: '0 auto' }}>
          <p>
            <IonAvatar
              style={{ margin: '0 auto', width: 100, height: 100, cursor: 'pointer' }}
              onClick={() => fileInput.current?.click()}
            >
              {avatar ? (
                <IonImg src={avatar} onIonError={(e: any) => (e.target.src = fallbackUserAvatar)} />
              ) : (
                <IonSkeletonText animated></IonSkeletonText>
              )}
            </IonAvatar>
            <input type="file" accept="image/*" onChange={uploadNewAvatar} ref={fileInput as any} hidden={true} />
          </p>
          <form onSubmit={handleSubmit}>
            <IonItem color="white">
              <IonLabel position="floating">First name</IonLabel>
              <IonInput required value={firstName} onIonChange={e => setFirstName(e.detail.value || '')}></IonInput>
            </IonItem>
            <IonItem color="white">
              <IonLabel position="floating">Last name</IonLabel>
              <IonInput required value={lastName} onIonChange={e => setLastName(e.detail.value || '')}></IonInput>
            </IonItem>
            <IonItem color="white">
              <IonLabel position="floating">ESN Country</IonLabel>
              <IonSelect interface="popover" value={ESNCountry} onIonChange={e => setESNCountry(e.detail.value)}>
                {ESNCountries.map(country => (
                  <IonSelectOption key={country} value={country}>
                    {country}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem color="white">
              <IonLabel position="floating">ESN Section</IonLabel>
              <IonSelect
                interface="popover"
                value={ESNSection}
                disabled={!ESNCountry}
                onIonChange={e => setESNSection(e.detail.value)}
              >
                {ESNSections.filter(s => s.country === ESNCountry).map(s => (
                  <IonSelectOption key={s.section} value={s.section}>
                    {s.section}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonButton type="submit" expand="block" style={{ marginTop: 20 }}>
              Save changes
            </IonButton>
          </form>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
