import { Hub } from 'aws-amplify';
import { Authenticator, Flex, Image, Text } from '@aws-amplify/ui-react';

import '@aws-amplify/ui-react/styles.css';

const Header = () => (
  <Flex justifyContent="center" padding={30}>
    <Image alt="logo" src="/assets/images/ESN-star-full-colour.png" width={100} />
  </Flex>
);

const Footer = () => (
  <Flex justifyContent="center" padding={30}>
    <Text color="white">Some useful info and links</Text>
  </Flex>
);

const AuthPage: React.FC = () => {
  const reloadOnSignIn = (data: any) => data.payload.event === 'signIn' && window.location.assign('');
  Hub.listen('auth', reloadOnSignIn);

  return (
    <Flex justifyContent="center" height="100vh">
      <Authenticator components={{ Header, Footer }}>{() => <></>}</Authenticator>
    </Flex>
  );
};

export default AuthPage;
