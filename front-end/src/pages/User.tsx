import { createRef, useEffect, useState } from 'react';
import {
  IonAvatar,
  IonButton,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
  useIonLoading,
  useIonToast
} from '@ionic/react';
import { cloudUpload, open, trash } from 'ionicons/icons';

import { isMobileMode, toastMessageDefaults } from '../utils';
import {
  downloadUserCV,
  getImageURLByURI,
  getUserProfile,
  saveUserProfile,
  updateUserAvatar,
  uploadUserCV,
  usersFallbackImageURL
} from '../utils/data';
import { UserProfile } from 'models/userProfile';
import { ESNCountries, ESNSections } from '../utils/ESNSections';
import { Languages } from '../utils/languages';
import { FieldsOfStudy } from '../utils/fieldsOfStudy';

const UserPage: React.FC = () => {
  const [showMessage] = useIonToast();
  const [showLoading, dismissLoading] = useIonLoading();

  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [errors, setErrors] = useState(new Set<string>());
  // if not set separately, it runs an infinite form loop
  const [languages, setLanguages] = useState<string[]>([]);

  const [avatar, setAvatar] = useState('');
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
      setLanguages(userProfile.languages);

      const avatar = getImageURLByURI(userProfile.imageURI);
      setAvatar(avatar);
    };
    loadData();
  }, []);

  const uploadNewAvatar = async (e: any): Promise<void> => {
    e.preventDefault();

    const reader = new FileReader();
    const file = e.target.files[0];

    try {
      await showLoading();
      reader.readAsDataURL(file);
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Error uploading the avatar.', color: 'danger' });
    }

    reader.onloadend = async (): Promise<void> => {
      const newImageURI = await updateUserAvatar(file);
      handleFieldChange('imageURI', newImageURI);

      setAvatar(reader.result as string);

      await dismissLoading();
    };
  };

  const uploadAndSetCV = async (event: any): Promise<void> => {
    event.preventDefault();

    const file = event.target.files[0];

    try {
      await showLoading();
      await uploadUserCV(file);

      handleFieldChange('hasUploadedCV', true);
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Error uploading the document.', color: 'danger' });
    } finally {
      await dismissLoading();
    }
  };

  const handleSubmit = async (event: any): Promise<void> => {
    event.preventDefault();

    if (!userProfile) return;

    userProfile.languages = languages;

    await showLoading();
    try {
      const errors = new Set(userProfile.validate());
      setErrors(errors);
      if (errors.size !== 0) throw new Error('Invalid fields');

      await saveUserProfile(userProfile);
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
              <IonItemDivider>
                <IonLabel>Basic Information</IonLabel>
              </IonItemDivider>
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
              <IonItemDivider>
                <IonLabel>Contacts</IonLabel>
              </IonItemDivider>
              <IonItem color="white">
                <IonLabel position="floating">Email</IonLabel>
                <IonInput
                  inputMode="email"
                  value={userProfile.contactEmail}
                  onIonChange={e => handleFieldChange('contactEmail', e.detail.value)}
                  className={fieldHasErrors('contactEmail') ? 'fieldHasError' : ''}
                ></IonInput>
              </IonItem>
              <IonItem color="white">
                <IonLabel position="floating">Phone</IonLabel>
                <IonInput
                  inputMode="tel"
                  value={userProfile.contactPhone}
                  onIonChange={e => handleFieldChange('contactPhone', e.detail.value)}
                  className={fieldHasErrors('contactPhone') ? 'fieldHasError' : ''}
                ></IonInput>
              </IonItem>
              <IonItemDivider>
                <IonLabel>Skills</IonLabel>
              </IonItemDivider>
              <IonItem color="white">
                <IonLabel position="stacked">Languages</IonLabel>
                <IonSelect
                  multiple
                  interface="popover"
                  value={languages}
                  onIonChange={e => setLanguages(e.detail.value)}
                  className={fieldHasErrors('languages') ? 'fieldHasError' : ''}
                >
                  {Languages.map(lang => (
                    <IonSelectOption key={lang} value={lang}>
                      {lang}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem color="white">
                <IonLabel position="stacked">Field of expertise</IonLabel>
                <IonSelect
                  interface="popover"
                  value={userProfile.fieldOfExpertise}
                  onIonChange={e => handleFieldChange('fieldOfExpertise', e.detail.value)}
                  className={fieldHasErrors('fieldOfExpertise') ? 'fieldHasError' : ''}
                >
                  {Object.keys(FieldsOfStudy).map(field => (
                    <IonSelectOption key={field} value={field}>
                      {field}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem color="white">
                <IonLabel position="stacked">Curriculum vitae</IonLabel>
                <IonInput readonly value={userProfile.hasUploadedCV ? 'PDF document' : ''}></IonInput>
                <input type="hidden" name="hasUploadedCV" value={userProfile.hasUploadedCV ? 'true' : ''}></input>
                <input type="file" accept="application/pdf" onChange={uploadAndSetCV} id="cv-input" hidden={true} />
                {userProfile.hasUploadedCV ? (
                  <>
                    <IonButton
                      slot="end"
                      fill="clear"
                      color="medium"
                      style={{ marginTop: 16 }}
                      onClick={() => handleFieldChange('hasUploadedCV', false)}
                    >
                      <IonIcon icon={trash} slot="icon-only"></IonIcon>
                    </IonButton>
                    <IonButton
                      slot="end"
                      fill="clear"
                      color="medium"
                      style={{ marginTop: 16 }}
                      onClick={downloadUserCV}
                    >
                      <IonIcon icon={open} slot="icon-only"></IonIcon>
                    </IonButton>
                  </>
                ) : (
                  <IonButton
                    slot="end"
                    fill="clear"
                    color="medium"
                    style={{ marginTop: 16 }}
                    onClick={() => document.getElementById('cv-input')?.click()}
                  >
                    <IonIcon icon={cloudUpload} slot="icon-only"></IonIcon>
                  </IonButton>
                )}
              </IonItem>
              <IonItemDivider>
                <IonLabel>ESN</IonLabel>
              </IonItemDivider>
              <IonItem color="white">
                <IonLabel position="stacked">ESN Country</IonLabel>
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
                <IonLabel position="stacked">ESN Section</IonLabel>
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
              <IonItemDivider>
                <IonLabel>Extra</IonLabel>
              </IonItemDivider>
              <IonItem color="white">
                <IonLabel position="stacked">About me</IonLabel>
                <IonTextarea
                  placeholder="Write something about you"
                  value={userProfile.bio}
                  onIonChange={e => handleFieldChange('bio', e.detail.value)}
                  className={fieldHasErrors('bio') ? 'fieldHasError' : ''}
                />
              </IonItem>
              <IonItem color="white">
                <IonLabel>Open to job:</IonLabel>
                <IonCheckbox
                  checked={userProfile.openToJob}
                  onIonChange={e => handleFieldChange('openToJob', e.detail.checked)}
                />
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

export default UserPage;
