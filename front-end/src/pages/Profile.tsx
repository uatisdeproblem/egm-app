import { createRef, useEffect, useState } from 'react';
import {
  IonAvatar,
  IonButton,
  IonCheckbox,
  IonContent,
  IonHeader,
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

import { isMobileMode, toastMessageDefaults } from '../utils';
import { getUserAvatarURL, getUserProfile, saveUserProfile, updateUserAvatar, fallbackUserAvatar } from '../utils/data';
import { ESNCountries, ESNSections } from '../utils/ESNSections';
import { Languages } from '../utils/languages';
import { FieldsOfStudy } from '../utils/fieldsOfStudy';

const ProfilePage: React.FC = () => {
  const [showMessage] = useIonToast();
  const [showLoading, dismissLoading] = useIonLoading();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ESNCountry, setESNCountry] = useState('');
  const [ESNSection, setESNSection] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [bio, setBio] = useState('');
  const [openToJob, setOpenToJob] = useState(false);
  const [languages, setLanguages] = useState<Array<string | null> | null>([]);
  const [fieldOfExpertise, setFieldOfExpertise] = useState('');

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
        setContactEmail(profile.contactEmail || '');
        setContactPhone(profile.contactPhone || '');
        setBio(profile.bio || '');
        setOpenToJob(profile.openToJob || false);
        setLanguages(profile.languages || null);
        setFieldOfExpertise(profile.fieldOfExpertise || '');
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
      await saveUserProfile({
        firstName,
        lastName,
        ESNCountry,
        ESNSection,
        contactEmail,
        contactPhone,
        bio,
        openToJob,
        languages,
        fieldOfExpertise
      });
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
                <IonSkeletonText animated />
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
              <IonInput required value={firstName} onIonChange={e => setFirstName(e.detail.value || '')} />
            </IonItem>
            <IonItem color="white">
              <IonLabel position="floating">Last name</IonLabel>
              <IonInput required value={lastName} onIonChange={e => setLastName(e.detail.value || '')} />
            </IonItem>
            <IonItemDivider>
              <IonLabel>Contacts</IonLabel>
            </IonItemDivider>
            <IonItem color="white">
              <IonLabel position="floating">Email</IonLabel>
              <IonInput value={contactEmail} onIonChange={e => setContactEmail(e.detail.value || '')} />
            </IonItem>
            <IonItem color="white">
              <IonLabel position="floating">Phone</IonLabel>
              <IonInput value={contactPhone} onIonChange={e => setContactPhone(e.detail.value || '')} />
            </IonItem>
            <IonItemDivider>
              <IonLabel>Skills</IonLabel>
            </IonItemDivider>
            <IonItem color="white">
              <IonLabel position="floating">Languages</IonLabel>
              <IonSelect multiple value={languages} onIonChange={e => setLanguages(e.detail.value)}>
                {Languages.map(lang => (
                  <IonSelectOption key={lang} value={lang}>
                    {lang}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem color="white">
              <IonLabel position="floating">Fields of expertise</IonLabel>
              <IonSelect value={fieldOfExpertise} onIonChange={e => setFieldOfExpertise(e.detail.value)}>
                {Object.keys(FieldsOfStudy).map(field => (
                  <IonSelectOption key={field} value={field}>
                    {field}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItemDivider>
              <IonLabel>ESN</IonLabel>
            </IonItemDivider>
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
            <IonItemDivider>
              <IonLabel>Extra</IonLabel>
            </IonItemDivider>
            <IonItem color="white">
              <IonLabel position="floating">About me</IonLabel>
              <IonTextarea
                placeholder="Write something about you"
                value={bio}
                onIonChange={e => setBio(e.detail.value || '')}
              />
            </IonItem>
            <IonItem color="white">
              <IonLabel>Open to job: </IonLabel>
              <IonCheckbox checked={openToJob} onIonChange={e => setOpenToJob(e.detail.checked)} />
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
