import Auth from '@aws-amplify/auth';
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
  IonModal,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonText,
  IonTextarea,
  IonToolbar,
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
  logoLinkedin
} from 'ionicons/icons';
import SocialCard from '../components/SocialCard';

import { toastMessageDefaults } from '../utils';
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

  const [segment, setSegment] = useState('friends');

  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [errors, setErrors] = useState(new Set<string>());
  // if not set separately, it runs an infinite form loop
  const [languages, setLanguages] = useState<string[]>([]);

  const [showModal, setShowModal] = useState(false);

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
      if (!userProfile.contactEmail) {
        const user = await Auth.currentAuthenticatedUser();
        userProfile.contactEmail = user.attributes.email;
      }
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
        <IonToolbar color="ideaToolbar" style={{ '--min-height': 'auto' }}>
          <IonSegment value={segment}>
            <IonSegmentButton value="friends" style={{ maxWidth: 150 }} onClick={() => setSegment('friends')}>
              Friends
            </IonSegmentButton>
            <IonSegmentButton value="profile" style={{ maxWidth: 150 }} onClick={() => setSegment('profile')}>
              Profile
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {segment === 'friends' && userProfile ? (
          <IonList style={{ maxWidth: 450, margin: '0 auto', textAlign: 'center' }}>
            <IonButton id="trigger-button" onClick={() => setShowModal(true)}>
              Click to connect with someone!
            </IonButton>
            <IonModal isOpen={showModal} trigger="trigger-button">
              <IonContent>
                <SocialCard avatar={avatar} profile={userProfile} toggleModal={setShowModal} />
              </IonContent>
            </IonModal>
          </IonList>
        ) : (
          ''
        )}
        {segment === 'profile' && userProfile ? (
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
