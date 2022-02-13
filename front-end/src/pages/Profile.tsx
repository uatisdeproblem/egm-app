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
import {
  getUserAvatarURL,
  getUserProfile,
  saveUserProfile,
  updateUserAvatar,
  usersFallbackImageURL
} from '../utils/data';
import { ESNCountries, ESNSections } from '../utils/ESNSections';
import { UserProfile } from 'models/userProfile';

const ProfilePage: React.FC = () => {
  const [showMessage] = useIonToast();
  const [showLoading, dismissLoading] = useIonLoading();

  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [errors, setErrors] = useState(new Set<string>());

  const [avatar, setAvatar] = useState('');
  const [avatarTempImageFile, setAvatarTempImageFile] = useState<File>();
  const fileInput = createRef<HTMLInputElement>();

  const handleFieldChange = (fieldName: string, value: any): void => {
    (userProfile as any)[fieldName] = value;
    setUserProfile(new UserProfile(userProfile));
  };
  const fieldHasErrors = (fieldName: string): boolean => errors.has(fieldName);

  useEffect(() => {
    const loadData = async () => {
      const userProfile = await getUserProfile();
      setUserProfile(userProfile);

      const avatar = await getUserAvatarURL(userProfile);
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
      const errors = new Set(userProfile?.validate());
      setErrors(errors);
      if (errors.size !== 0) throw new Error('Invalid fields');

      if (avatarTempImageFile) await updateUserAvatar(avatarTempImageFile);

      await saveUserProfile(userProfile!);
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
        {userProfile ? (
          <IonList style={{ maxWidth: 450, margin: '0 auto' }}>
            <p>
              <IonAvatar
                style={{ margin: '0 auto', width: 100, height: 100, cursor: 'pointer' }}
                onClick={() => fileInput.current?.click()}
              >
                {avatar ? (
                  <IonImg src={avatar} onIonError={(e: any) => (e.target.src = usersFallbackImageURL)} />
                ) : (
                  <IonSkeletonText animated></IonSkeletonText>
                )}
              </IonAvatar>
              <input type="file" accept="image/*" onChange={uploadNewAvatar} ref={fileInput as any} hidden={true} />
            </p>
            <form onSubmit={handleSubmit}>
              <IonItem color="white">
                <IonLabel position="floating">First name</IonLabel>
                <IonInput
                  required
                  value={userProfile.firstName}
                  onIonChange={e => handleFieldChange('firstName', e.detail.value)}
                  className={fieldHasErrors('firstName') ? 'fieldHasError' : ''}
                ></IonInput>
              </IonItem>
              <IonItem color="white">
                <IonLabel position="floating">Last name</IonLabel>
                <IonInput
                  required
                  value={userProfile.lastName}
                  onIonChange={e => handleFieldChange('lastName', e.detail.value)}
                  className={fieldHasErrors('lastName') ? 'fieldHasError' : ''}
                ></IonInput>
              </IonItem>
              <IonItem color="white">
                <IonLabel position="floating">ESN Country</IonLabel>
                <IonSelect
                  interface="popover"
                  value={userProfile.ESNCountry}
                  onIonChange={e => {
                    userProfile.ESNSection = '';
                    handleFieldChange('ESNCountry', e.detail.value);
                  }}
                  className={fieldHasErrors('ESNCountry') ? 'fieldHasError' : ''}
                >
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
                  value={userProfile.ESNSection}
                  disabled={!userProfile.ESNCountry}
                  onIonChange={e => handleFieldChange('ESNSection', e.detail.value)}
                  className={fieldHasErrors('ESNSection') ? 'fieldHasError' : ''}
                >
                  {ESNSections.filter(s => s.country === userProfile.ESNCountry).map(s => (
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
        ) : (
          ''
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
