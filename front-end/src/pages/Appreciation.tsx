import { Auth } from '@aws-amplify/auth';
import {
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonList,
    IonPage,
    IonTitle,
    IonToolbar,
    useIonAlert,
    IonNote,
    IonTextarea,
    IonButton,
    IonText,
    IonItemGroup,
} from '@ionic/react';
import {
    close,
    heartOutline,
    send,
} from 'ionicons/icons';
import { useEffect, useState } from 'react';

import { UserProfile } from 'models/userProfile';
import { Message } from 'models/message';

import { isMobileMode } from '../utils';
import {
    isUserAdmin, getUserProfile, getMessages,
    sendMessage,
    deleteMessage,
} from '../utils/data';

// TODO placeholder
const allMessages = [{
    messageId: "1234-uuid",
    senderId: "3456-uuid",
    senderName: "Jose Gonzalez",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam viverra diam quis odio hendrerit molestie. Nam iaculis nunc eget urna tincidunt, sit amet fringilla ex aliquet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam malesuada molestie condimentum. Duis placerat enim vel ipsum gravida pellentesque sit amet ut sapien.",
} as Message]

const AppreciationPage: React.FC = () => {
    const [showAlert] = useIonAlert();

    const [userIsAdmin, setUserIsAdmin] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile>();

    const [text, setText] = useState<string>();
    const [messages, setMessages] = useState<Message[]>();


    console.log(userProfile);
    useEffect(() => {
        const loadData = async () => {
            const userProfile = await getUserProfile();
            setUserProfile(userProfile);

            setUserIsAdmin(await isUserAdmin());


            setMessages(allMessages); // setMessages(await getMessages());
        };
        loadData();
    }, []);


    const handleSendMessage = async () => {
        const message = {
            senderId: userProfile?.userId,
            senderName: userProfile?.getName(),
            text: text,
        }

        await sendMessage(message as Message);
        setText("");
    }

    const handleDeleteMessage = async (message: Message) => {
        await deleteMessage(message);
    }

    return (
        <IonPage>
            <IonHeader>
                {isMobileMode() ? (
                    <IonToolbar color="ideaToolbar">
                        <IonTitle>Appreciation</IonTitle>
                    </IonToolbar>
                ) : (
                    ''
                )}
            </IonHeader>
            <IonContent>
                <IonList style={{ maxWidth: isMobileMode() ? "100%" : "50%", margin: '0 auto' }}>
                    {messages?.map(message => (
                        <IonItemGroup>
                            <IonItem color="white">
                                <IonNote slot="start">{message.senderName}</IonNote>

                                <IonButton fill="solid" slot="end" color="white">
                                    <IonIcon icon={heartOutline} />
                                    <IonNote style={{ marginLeft: '4px' }} slot="end">{0}</IonNote>
                                </IonButton>

                                {userIsAdmin && <IonButton fill="solid" slot="end" color="white" onClick={() => handleDeleteMessage(message)}>
                                    <IonIcon icon={close} />
                                    <IonNote style={{ marginLeft: '4px' }} slot="end">Delete</IonNote>
                                </IonButton>}

                            </IonItem>
                            <IonItem color="white" >
                                <IonText style={{ paddingBottom: '12px' }}>{message.text}</IonText>
                            </IonItem>
                        </IonItemGroup>
                    ))}

                    <IonItemDivider>
                        <IonLabel>Write a Message</IonLabel>
                    </IonItemDivider>

                    <IonItemGroup color="white">
                        <IonItem color="white" >
                            <IonTextarea value={text} onIonChange={e => setText(e.detail.value!)}></IonTextarea>
                            <IonButton size="default" style={{ alignSelf: 'center' }} onClick={() => handleSendMessage()} >
                                Send
                                <IonIcon icon={send} slot="end"></IonIcon>
                            </IonButton>
                        </IonItem>
                    </IonItemGroup>

                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default AppreciationPage;
