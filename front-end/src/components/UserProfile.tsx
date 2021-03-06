import { Auth } from '@aws-amplify/auth';
import { createRef, useEffect, useState } from 'react';
import {
  IonAvatar,
  IonButton,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonText,
  IonTextarea,
  useIonAlert,
  useIonLoading,
  useIonToast
} from '@ionic/react';
import {
  cloudUpload,
  open,
  trash,
  logoFacebook,
  logoInstagram,
  logoTwitter,
  logoTiktok,
  logoLinkedin,
  eyeOff
} from 'ionicons/icons';

import { UserProfile } from 'models/userProfile';

import { toastMessageDefaults } from '../utils';
import {
  deleteUserAccount,
  downloadUserCV,
  getImageURLByURI,
  resetUserProfile,
  saveUserProfile,
  updateUserAvatar,
  uploadUserCV,
  usersFallbackImageURL
} from '../utils/data';
import { ESNCountries, ESNSections } from '../utils/ESNSections';
import { Languages } from '../utils/languages';

import ChangeUserEmailComponent from './ChangeUserEmailComponent';

interface ContainerProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
}

const UserProfileComponent: React.FC<ContainerProps> = ({ profile, onChange }) => {
  const [showMessage] = useIonToast();
  const [showAlert] = useIonAlert();
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
      if (!profile.contactEmail) {
        const user = await Auth.currentAuthenticatedUser();
        profile.contactEmail = user.attributes.email;
      }
      setUserProfile(profile);
      setLanguages(profile.languages);

      if (profile.imageURI) setAvatar(getImageURLByURI(profile.imageURI));
      else setAvatar(usersFallbackImageURL);
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

      onChange(userProfile);
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

  const resetProfile = async (): Promise<void> => {
    await showLoading();
    try {
      await resetUserProfile();
      window.location.reload();
    } catch (err) {
      await showMessage({
        ...toastMessageDefaults,
        message: 'Something went wrong; please, try again.',
        color: 'danger'
      });
    } finally {
      await dismissLoading();
    }
  };
  const askAndResetProfile = async (): Promise<void> => {
    const header = 'Reset your profile';
    const message = 'Are you sure?';
    const buttons = [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Reset', handler: () => resetProfile() }
    ];
    await showAlert({ header, message, buttons });
  };

  const deleteAccount = async (): Promise<void> => {
    await showLoading();
    try {
      await deleteUserAccount();
      await Auth.signOut();
      // fix known Cognito bug (QuotaExceededError): https://github.com/aws-amplify/amplify-js/issues/9140
      window.localStorage.clear();
      window.location.reload();
    } catch (err) {
      await showMessage({
        ...toastMessageDefaults,
        message: 'Something went wrong; please, try again.',
        color: 'danger'
      });
    } finally {
      await dismissLoading();
    }
  };
  const askAndDeleteAccount = async (): Promise<void> => {
    const header = 'Delete your account';
    const message = 'Are you sure?';
    const buttons = [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Delete', handler: () => deleteAccount() }
    ];
    await showAlert({ header, message, buttons });
  };

  return userProfile ? (
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
        <ChangeUserEmailComponent></ChangeUserEmailComponent>
        <IonItem color="white">
          <IonLabel position="floating">
            First name <IonText color="danger">*</IonText>
          </IonLabel>
          <IonInput
            required
            value={userProfile.firstName}
            onIonChange={e => handleFieldChange('firstName', e.detail.value)}
            className={fieldHasErrors('firstName') ? 'fieldHasError' : ''}
          ></IonInput>
        </IonItem>
        <IonItem color="white">
          <IonLabel position="floating">
            Last name <IonText color="danger">*</IonText>
          </IonLabel>
          <IonInput
            required
            value={userProfile.lastName}
            onIonChange={e => handleFieldChange('lastName', e.detail.value)}
            className={fieldHasErrors('lastName') ? 'fieldHasError' : ''}
          ></IonInput>
        </IonItem>
        <IonItem color="white">
          <IonLabel position="stacked">Languages you speak</IonLabel>
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
          <IonLabel>Present yourself to the other participants</IonLabel>
        </IonItemDivider>
        <IonItem color="white">
          <IonTextarea
            placeholder="Write something about you"
            value={userProfile.bio}
            maxlength={300}
            rows={4}
            onIonChange={e => handleFieldChange('bio', e.detail.value)}
            className={fieldHasErrors('bio') ? 'fieldHasError' : ''}
          />
        </IonItem>
        <IonItemDivider>
          <IonLabel>Contacts</IonLabel>
        </IonItemDivider>
        <IonItem color="white">
          <IonLabel position="floating">
            Email <IonText color="danger">*</IonText>
          </IonLabel>
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
          <IonLabel>Social</IonLabel>
        </IonItemDivider>
        <IonItem color="white">
          <IonIcon icon={logoFacebook} slot="start" />
          <IonInput
            inputMode="url"
            value={userProfile.facebook}
            onIonChange={e => handleFieldChange('facebook', e.detail.value)}
            className={fieldHasErrors('facebook') ? 'fieldHasError' : ''}
          />
        </IonItem>
        <IonItem color="white">
          <IonIcon icon={logoInstagram} slot="start" />
          <IonInput
            inputMode="url"
            value={userProfile.instagram}
            onIonChange={e => handleFieldChange('instagram', e.detail.value)}
            className={fieldHasErrors('instagram') ? 'fieldHasError' : ''}
          />
        </IonItem>
        <IonItem color="white">
          <IonIcon icon={logoTwitter} slot="start" />
          <IonInput
            inputMode="url"
            value={userProfile.twitter}
            onIonChange={e => handleFieldChange('twitter', e.detail.value)}
            className={fieldHasErrors('twitter') ? 'fieldHasError' : ''}
          />
        </IonItem>
        <IonItem color="white">
          <IonIcon icon={logoTiktok} slot="start" />
          <IonInput
            inputMode="url"
            value={userProfile.tiktok}
            onIonChange={e => handleFieldChange('tiktok', e.detail.value)}
            className={fieldHasErrors('tiktok') ? 'fieldHasError' : ''}
          />
        </IonItem>
        <IonItem color="white">
          <IonIcon icon={logoLinkedin} slot="start" />
          <IonInput
            inputMode="url"
            value={userProfile.linkedin}
            onIonChange={e => handleFieldChange('linkedin', e.detail.value)}
            className={fieldHasErrors('linkedin') ? 'fieldHasError' : ''}
          />
        </IonItem>
        {true ? (
          // disabled #41
          ''
        ) : (
          <>
            <IonItemDivider>
              <IonLabel>Skills</IonLabel>
            </IonItemDivider>
            <IonItem color="white">
              <IonLabel position="stacked">Curriculum vitae</IonLabel>
              <IonInput readonly value={userProfile!.hasUploadedCV ? 'PDF document' : ''}></IonInput>
              <input type="hidden" name="hasUploadedCV" value={userProfile!.hasUploadedCV ? 'true' : ''}></input>
              <input type="file" accept="application/pdf" onChange={uploadAndSetCV} id="cv-input" hidden={true} />
              {userProfile!.hasUploadedCV ? (
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
                  <IonButton slot="end" fill="clear" color="medium" style={{ marginTop: 16 }} onClick={downloadUserCV}>
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
          </>
        )}
        <IonButton type="submit" expand="block" style={{ marginTop: 20 }}>
          Save changes
        </IonButton>
      </form>
      <div style={{ marginTop: 40 }}>
        {profile.getName() ? (
          <IonButton
            fill="clear"
            color="medium"
            expand="block"
            className="ion-text-wrap"
            style={{ textTransform: 'none' }}
            onClick={askAndResetProfile}
          >
            <IonIcon icon={eyeOff} slot="start"></IonIcon> I don't want to be found by other participants anymore.
          </IonButton>
        ) : (
          ''
        )}
        <IonButton
          fill="clear"
          color="danger"
          expand="block"
          style={{ textTransform: 'none' }}
          onClick={askAndDeleteAccount}
        >
          <IonIcon icon={trash} slot="start"></IonIcon> Delete account
        </IonButton>
      </div>
    </IonList>
  ) : (
    <></>
  );
};

export default UserProfileComponent;
